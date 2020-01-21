"use strict";
/*!
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const logger_1 = require("./logger");
/**
 * An auto-resizing pool that distributes concurrent operations over multiple
 * clients of type `T`.
 *
 * ClientPool is used within Firestore to manage a pool of GAPIC clients and
 * automatically initializes multiple clients if we issue more than 100
 * concurrent operations.
 *
 * @private
 */
class ClientPool {
    /**
     * @param concurrentOperationLimit The number of operations that each client
     * can handle.
     * @param maxIdleClients The maximum number of idle clients to keep before
     * garbage collecting.
     * @param clientFactory A factory function called as needed when new clients
     * are required.
     * @param clientDestructor A cleanup function that is called when a client is
     * disposed of.
     */
    constructor(concurrentOperationLimit, maxIdleClients, clientFactory, clientDestructor = () => Promise.resolve()) {
        this.concurrentOperationLimit = concurrentOperationLimit;
        this.maxIdleClients = maxIdleClients;
        this.clientFactory = clientFactory;
        this.clientDestructor = clientDestructor;
        /**
         * Stores each active clients and how many operations it has outstanding.
         * @private
         */
        this.activeClients = new Map();
        /**
         * Whether the Firestore instance has been terminated. Once terminated, the
         * ClientPool can longer schedule new operations.
         */
        this.terminated = false;
    }
    /**
     * Returns an already existing client if it has less than the maximum number
     * of concurrent operations or initializes and returns a new client.
     *
     * @private
     */
    acquire(requestTag) {
        let selectedClient = null;
        let selectedClientRequestCount = -1;
        for (const [client, requestCount] of this.activeClients) {
            // Use the "most-full" client that can still accommodate the request
            // in order to maximize the number of idle clients as operations start to
            // complete.
            if (requestCount > selectedClientRequestCount &&
                requestCount < this.concurrentOperationLimit) {
                selectedClient = client;
                selectedClientRequestCount = requestCount;
            }
        }
        if (selectedClient) {
            logger_1.logger('ClientPool.acquire', requestTag, 'Re-using existing client with %s remaining operations', this.concurrentOperationLimit - selectedClientRequestCount);
        }
        else {
            logger_1.logger('ClientPool.acquire', requestTag, 'Creating a new client');
            selectedClient = this.clientFactory();
            selectedClientRequestCount = 0;
            assert(!this.activeClients.has(selectedClient), 'The provided client factory returned an existing instance');
        }
        this.activeClients.set(selectedClient, selectedClientRequestCount + 1);
        return selectedClient;
    }
    /**
     * Reduces the number of operations for the provided client, potentially
     * removing it from the pool of active clients.
     * @private
     */
    async release(requestTag, client) {
        const requestCount = this.activeClients.get(client) || 0;
        assert(requestCount > 0, 'No active request');
        this.activeClients.set(client, requestCount - 1);
        if (this.shouldGarbageCollectClient(client)) {
            this.activeClients.delete(client);
            await this.clientDestructor(client);
            logger_1.logger('ClientPool.release', requestTag, 'Garbage collected 1 client');
        }
    }
    /**
     * Given the current operation counts, determines if the given client should
     * be garbage collected.
     * @private
     */
    shouldGarbageCollectClient(client) {
        if (this.activeClients.get(client) !== 0) {
            return false;
        }
        let idleCapacityCount = 0;
        for (const [_, count] of this.activeClients) {
            idleCapacityCount += this.concurrentOperationLimit - count;
        }
        return (idleCapacityCount > this.maxIdleClients * this.concurrentOperationLimit);
    }
    /**
     * The number of currently registered clients.
     *
     * @return Number of currently registered clients.
     * @private
     */
    // Visible for testing.
    get size() {
        return this.activeClients.size;
    }
    /**
     * The number of currently active operations.
     *
     * @return Number of currently active operations.
     * @private
     */
    // Visible for testing.
    get opCount() {
        let activeOperationCount = 0;
        this.activeClients.forEach(count => (activeOperationCount += count));
        return activeOperationCount;
    }
    /**
     * Runs the provided operation in this pool. This function may create an
     * additional client if all existing clients already operate at the concurrent
     * operation limit.
     *
     * @param requestTag A unique client-assigned identifier for this operation.
     * @param op A callback function that returns a Promise. The client T will
     * be returned to the pool when callback finishes.
     * @return A Promise that resolves with the result of `op`.
     * @private
     */
    run(requestTag, op) {
        if (this.terminated) {
            return Promise.reject('The client has already been terminated');
        }
        const client = this.acquire(requestTag);
        return op(client)
            .catch(async (err) => {
            await this.release(requestTag, client);
            return Promise.reject(err);
        })
            .then(async (res) => {
            await this.release(requestTag, client);
            return res;
        });
    }
    async terminate() {
        this.terminated = true;
        for (const [client, _requestCount] of this.activeClients) {
            this.activeClients.delete(client);
            await this.clientDestructor(client);
        }
    }
}
exports.ClientPool = ClientPool;
//# sourceMappingURL=pool.js.map