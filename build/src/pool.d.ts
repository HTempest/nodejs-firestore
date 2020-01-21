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
export declare class ClientPool<T> {
    private readonly concurrentOperationLimit;
    private readonly maxIdleClients;
    private readonly clientFactory;
    private readonly clientDestructor;
    /**
     * Stores each active clients and how many operations it has outstanding.
     * @private
     */
    private activeClients;
    /**
     * Whether the Firestore instance has been terminated. Once terminated, the
     * ClientPool can longer schedule new operations.
     */
    private terminated;
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
    constructor(concurrentOperationLimit: number, maxIdleClients: number, clientFactory: () => T, clientDestructor?: (client: T) => Promise<void>);
    /**
     * Returns an already existing client if it has less than the maximum number
     * of concurrent operations or initializes and returns a new client.
     *
     * @private
     */
    private acquire;
    /**
     * Reduces the number of operations for the provided client, potentially
     * removing it from the pool of active clients.
     * @private
     */
    private release;
    /**
     * Given the current operation counts, determines if the given client should
     * be garbage collected.
     * @private
     */
    private shouldGarbageCollectClient;
    /**
     * The number of currently registered clients.
     *
     * @return Number of currently registered clients.
     * @private
     */
    readonly size: number;
    /**
     * The number of currently active operations.
     *
     * @return Number of currently active operations.
     * @private
     */
    readonly opCount: number;
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
    run<V>(requestTag: string, op: (client: T) => Promise<V>): Promise<V>;
    terminate(): Promise<void>;
}
