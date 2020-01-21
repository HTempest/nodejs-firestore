"use strict";
// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const chaiAsPromised = require("chai-as-promised");
const pool_1 = require("../src/pool");
const util_1 = require("../src/util");
chai_1.use(chaiAsPromised);
const REQUEST_TAG = 'tag';
function deferredPromises(count) {
    const deferred = [];
    for (let i = 0; i < count; ++i) {
        deferred.push(new util_1.Deferred());
    }
    return deferred;
}
describe('Client pool', () => {
    it('creates new instances as needed', () => {
        const clientPool = new pool_1.ClientPool(3, 0, () => {
            return {};
        });
        chai_1.expect(clientPool.size).to.equal(0);
        const operationPromises = deferredPromises(4);
        clientPool.run(REQUEST_TAG, () => operationPromises[0].promise);
        chai_1.expect(clientPool.size).to.equal(1);
        clientPool.run(REQUEST_TAG, () => operationPromises[1].promise);
        chai_1.expect(clientPool.size).to.equal(1);
        clientPool.run(REQUEST_TAG, () => operationPromises[2].promise);
        chai_1.expect(clientPool.size).to.equal(1);
        clientPool.run(REQUEST_TAG, () => operationPromises[3].promise);
        chai_1.expect(clientPool.size).to.equal(2);
    });
    it('re-uses instances with remaining capacity', () => {
        const clientPool = new pool_1.ClientPool(2, 0, () => {
            return {};
        });
        chai_1.expect(clientPool.size).to.equal(0);
        const operationPromises = deferredPromises(5);
        const completionPromise = clientPool.run(REQUEST_TAG, () => operationPromises[0].promise);
        chai_1.expect(clientPool.size).to.equal(1);
        clientPool.run(REQUEST_TAG, () => operationPromises[1].promise);
        chai_1.expect(clientPool.size).to.equal(1);
        clientPool.run(REQUEST_TAG, () => operationPromises[2].promise);
        chai_1.expect(clientPool.size).to.equal(2);
        clientPool.run(REQUEST_TAG, () => operationPromises[3].promise);
        chai_1.expect(clientPool.size).to.equal(2);
        operationPromises[0].resolve();
        return completionPromise.then(() => {
            clientPool.run(REQUEST_TAG, () => operationPromises[4].promise);
            chai_1.expect(clientPool.size).to.equal(2);
        });
    });
    it('re-uses idle instances', async () => {
        let instanceCount = 0;
        const clientPool = new pool_1.ClientPool(1, 1, () => {
            ++instanceCount;
            return {};
        });
        const operationPromises = deferredPromises(2);
        let completionPromise = clientPool.run(REQUEST_TAG, () => operationPromises[0].promise);
        chai_1.expect(clientPool.size).to.equal(1);
        operationPromises[0].resolve();
        await completionPromise;
        completionPromise = clientPool.run(REQUEST_TAG, () => operationPromises[1].promise);
        chai_1.expect(clientPool.size).to.equal(1);
        operationPromises[1].resolve();
        await completionPromise;
        chai_1.expect(instanceCount).to.equal(1);
    });
    it('bin packs operations', async () => {
        let clientCount = 0;
        const clientPool = new pool_1.ClientPool(2, 0, () => {
            return ++clientCount;
        });
        chai_1.expect(clientPool.size).to.equal(0);
        // Create 5 operations, which should schedule 2 operations on the first
        // client, 2 on the second and 1 on the third.
        const operationPromises = deferredPromises(7);
        clientPool.run(REQUEST_TAG, client => {
            chai_1.expect(client).to.be.equal(1);
            return operationPromises[0].promise;
        });
        clientPool.run(REQUEST_TAG, client => {
            chai_1.expect(client).to.be.equal(1);
            return operationPromises[1].promise;
        });
        const thirdOperation = clientPool.run(REQUEST_TAG, client => {
            chai_1.expect(client).to.be.equal(2);
            return operationPromises[2].promise;
        });
        clientPool.run(REQUEST_TAG, client => {
            chai_1.expect(client).to.be.equal(2);
            return operationPromises[3].promise;
        });
        clientPool.run(REQUEST_TAG, client => {
            chai_1.expect(client).to.be.equal(3);
            return operationPromises[4].promise;
        });
        // Free one slot on the second client.
        operationPromises[2].resolve();
        await thirdOperation;
        // A newly scheduled operation should use the first client that has a free
        // slot.
        clientPool.run(REQUEST_TAG, async (client) => {
            chai_1.expect(client).to.be.equal(2);
        });
    });
    it('garbage collects after success', () => {
        const clientPool = new pool_1.ClientPool(2, 0, () => {
            return {};
        });
        chai_1.expect(clientPool.size).to.equal(0);
        const operationPromises = deferredPromises(4);
        const completionPromises = [];
        completionPromises.push(clientPool.run(REQUEST_TAG, () => operationPromises[0].promise));
        chai_1.expect(clientPool.size).to.equal(1);
        completionPromises.push(clientPool.run(REQUEST_TAG, () => operationPromises[1].promise));
        chai_1.expect(clientPool.size).to.equal(1);
        completionPromises.push(clientPool.run(REQUEST_TAG, () => operationPromises[2].promise));
        chai_1.expect(clientPool.size).to.equal(2);
        completionPromises.push(clientPool.run(REQUEST_TAG, () => operationPromises[3].promise));
        chai_1.expect(clientPool.size).to.equal(2);
        operationPromises.forEach(deferred => deferred.resolve());
        return Promise.all(completionPromises).then(() => {
            chai_1.expect(clientPool.size).to.equal(0);
        });
    });
    it('garbage collects after error', () => {
        const clientPool = new pool_1.ClientPool(2, 0, () => {
            return {};
        });
        chai_1.expect(clientPool.size).to.equal(0);
        const operationPromises = deferredPromises(4);
        const completionPromises = [];
        completionPromises.push(clientPool.run(REQUEST_TAG, () => operationPromises[0].promise));
        chai_1.expect(clientPool.size).to.equal(1);
        completionPromises.push(clientPool.run(REQUEST_TAG, () => operationPromises[1].promise));
        chai_1.expect(clientPool.size).to.equal(1);
        completionPromises.push(clientPool.run(REQUEST_TAG, () => operationPromises[2].promise));
        chai_1.expect(clientPool.size).to.equal(2);
        completionPromises.push(clientPool.run(REQUEST_TAG, () => operationPromises[3].promise));
        chai_1.expect(clientPool.size).to.equal(2);
        operationPromises.forEach(deferred => deferred.reject());
        return Promise.all(completionPromises.map(p => p.catch(() => { }))).then(() => {
            chai_1.expect(clientPool.size).to.equal(0);
        });
    });
    it('garbage collection calls destructor', () => {
        const garbageCollect = new util_1.Deferred();
        const clientPool = new pool_1.ClientPool(1, 0, () => ({}), () => Promise.resolve(garbageCollect.resolve()));
        const operationPromises = deferredPromises(2);
        // Create two pending operations that each spawn their own client
        clientPool.run(REQUEST_TAG, () => operationPromises[0].promise);
        clientPool.run(REQUEST_TAG, () => operationPromises[1].promise);
        operationPromises.forEach(deferred => deferred.resolve());
        return garbageCollect.promise;
    });
    it('forwards success', () => {
        const clientPool = new pool_1.ClientPool(1, 0, () => {
            return {};
        });
        const op = clientPool.run(REQUEST_TAG, () => Promise.resolve('Success'));
        return chai_1.expect(op).to.become('Success');
    });
    it('forwards failure', () => {
        const clientPool = new pool_1.ClientPool(1, 0, () => {
            return {};
        });
        const op = clientPool.run(REQUEST_TAG, () => Promise.reject('Generated error'));
        return chai_1.expect(op).to.eventually.be.rejectedWith('Generated error');
    });
    it('keeps pool of idle clients', async () => {
        const clientPool = new pool_1.ClientPool(
        /* concurrentOperationLimit= */ 1, 
        /* maxIdleClients= */ 3, () => {
            return {};
        });
        const operationPromises = deferredPromises(4);
        clientPool.run(REQUEST_TAG, () => operationPromises[0].promise);
        clientPool.run(REQUEST_TAG, () => operationPromises[1].promise);
        clientPool.run(REQUEST_TAG, () => operationPromises[2].promise);
        const lastOp = clientPool.run(REQUEST_TAG, () => operationPromises[3].promise);
        chai_1.expect(clientPool.size).to.equal(4);
        // Resolve all pending operations. Note that one client is removed, while
        // 3 are kept for further usage.
        operationPromises.forEach(deferred => deferred.resolve());
        await lastOp;
        chai_1.expect(clientPool.size).to.equal(3);
    });
    it('default setting keeps at least one idle client', async () => {
        const clientPool = new pool_1.ClientPool(1, 
        /* maxIdleClients= git c*/ 1, () => {
            return {};
        });
        const operationPromises = deferredPromises(2);
        clientPool.run(REQUEST_TAG, () => operationPromises[0].promise);
        const completionPromise = clientPool.run(REQUEST_TAG, () => operationPromises[1].promise);
        chai_1.expect(clientPool.size).to.equal(2);
        operationPromises[0].resolve();
        operationPromises[1].resolve();
        await completionPromise;
        chai_1.expect(clientPool.size).to.equal(1);
    });
    it('rejects subsequent operations after being terminated', () => {
        const clientPool = new pool_1.ClientPool(1, 0, () => {
            return {};
        });
        return clientPool
            .terminate()
            .then(() => {
            return clientPool.run(REQUEST_TAG, () => Promise.reject('Call to run() should have failed'));
        })
            .catch((err) => {
            chai_1.expect(err).to.equal('The client has already been terminated');
        });
    });
});
//# sourceMappingURL=pool.js.map