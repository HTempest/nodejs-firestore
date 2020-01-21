"use strict";
// Copyright 2019 Google LLC
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
const src_1 = require("../src");
const helpers_1 = require("./util/helpers");
const REQUEST_TIME = 'REQUEST_TIME';
// Change the argument to 'console.log' to enable debug output.
src_1.setLogFunction(() => { });
const PROJECT_ID = 'test-project';
describe('set() method', () => {
    let firestore;
    let writeBatch;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreClient => {
            firestore = firestoreClient;
            writeBatch = firestore.batch();
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('requires document name', () => {
        chai_1.expect(() => writeBatch.set()).to.throw('Value for argument "documentRef" is not a valid DocumentReference.');
    });
    it('requires object', () => {
        chai_1.expect(() => writeBatch.set(firestore.doc('sub/doc'))).to.throw('Value for argument "data" is not a valid Firestore document. Input is not a plain JavaScript object.');
    });
    it('accepts preconditions', () => {
        writeBatch.set(firestore.doc('sub/doc'), { exists: false });
    });
    it('works with null objects', () => {
        const nullObject = Object.create(null);
        nullObject.bar = 'ack';
        writeBatch.set(firestore.doc('sub/doc'), nullObject);
    });
});
describe('delete() method', () => {
    let firestore;
    let writeBatch;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreInstance => {
            firestore = firestoreInstance;
            writeBatch = firestore.batch();
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('requires document name', () => {
        chai_1.expect(() => writeBatch.delete()).to.throw('Value for argument "documentRef" is not a valid DocumentReference.');
    });
    it('accepts preconditions', () => {
        writeBatch.delete(firestore.doc('sub/doc'), {
            lastUpdateTime: new src_1.Timestamp(479978400, 123000000),
        });
    });
});
describe('update() method', () => {
    let firestore;
    let writeBatch;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreInstance => {
            firestore = firestoreInstance;
            writeBatch = firestore.batch();
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('requires document name', () => {
        chai_1.expect(() => writeBatch.update({}, {})).to.throw('Value for argument "documentRef" is not a valid DocumentReference.');
    });
    it('requires object', () => {
        chai_1.expect(() => {
            writeBatch.update(firestore.doc('sub/doc'), firestore.doc('sub/doc'));
        }).to.throw('Update() requires either a single JavaScript object or an alternating list of field/value pairs that can be followed by an optional precondition. Value for argument "dataOrField" is not a valid Firestore document. Detected an object of type "DocumentReference" that doesn\'t match the expected instance. Please ensure that the Firestore types you are using are from the same NPM package.');
    });
    it('accepts preconditions', () => {
        writeBatch.update(firestore.doc('sub/doc'), { foo: 'bar' }, { lastUpdateTime: new src_1.Timestamp(479978400, 123000000) });
    });
    it('works with null objects', () => {
        const nullObject = Object.create(null);
        nullObject.bar = 'ack';
        writeBatch.update(firestore.doc('sub/doc'), nullObject);
    });
});
describe('create() method', () => {
    let firestore;
    let writeBatch;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreClient => {
            firestore = firestoreClient;
            writeBatch = firestore.batch();
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('requires document name', () => {
        chai_1.expect(() => writeBatch.create()).to.throw('Value for argument "documentRef" is not a valid DocumentReference.');
    });
    it('requires object', () => {
        chai_1.expect(() => {
            writeBatch.create(firestore.doc('sub/doc'));
        }).to.throw('Value for argument "data" is not a valid Firestore document. Input is not a plain JavaScript object.');
    });
    it('works with null objects', () => {
        const nullObject = Object.create(null);
        nullObject.bar = 'ack';
        writeBatch.create(firestore.doc('sub/doc'), nullObject);
    });
});
describe('batch support', () => {
    const documentName = `projects/${PROJECT_ID}/databases/(default)/documents/col/doc`;
    let firestore;
    let writeBatch;
    beforeEach(() => {
        const overrides = {
            commit: request => {
                chai_1.expect(request).to.deep.eq({
                    database: `projects/${PROJECT_ID}/databases/(default)`,
                    writes: [
                        {
                            update: {
                                fields: {},
                                name: documentName,
                            },
                        },
                        {
                            transform: {
                                document: documentName,
                                fieldTransforms: [
                                    {
                                        fieldPath: 'foo',
                                        setToServerValue: REQUEST_TIME,
                                    },
                                ],
                            },
                        },
                        {
                            currentDocument: {
                                exists: true,
                            },
                            update: {
                                fields: {
                                    foo: {
                                        stringValue: 'bar',
                                    },
                                },
                                name: documentName,
                            },
                            updateMask: {
                                fieldPaths: ['foo'],
                            },
                        },
                        {
                            currentDocument: {
                                exists: false,
                            },
                            update: {
                                fields: {},
                                name: documentName,
                            },
                        },
                        {
                            delete: documentName,
                        },
                    ],
                });
                return helpers_1.response({
                    commitTime: {
                        nanos: 0,
                        seconds: 0,
                    },
                    writeResults: [
                        // This write result conforms to the Write +
                        // DocumentTransform and won't be returned in the response.
                        {
                            updateTime: {
                                nanos: 1337,
                                seconds: 1337,
                            },
                        },
                        {
                            updateTime: {
                                nanos: 0,
                                seconds: 0,
                            },
                        },
                        {
                            updateTime: {
                                nanos: 1,
                                seconds: 1,
                            },
                        },
                        {
                            updateTime: {
                                nanos: 2,
                                seconds: 2,
                            },
                        },
                        {
                            updateTime: {
                                nanos: 3,
                                seconds: 3,
                            },
                        },
                    ],
                });
            },
        };
        return helpers_1.createInstance(overrides).then(firestoreClient => {
            firestore = firestoreClient;
            writeBatch = firestore.batch();
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    function verifyResponse(writeResults) {
        chai_1.expect(writeResults[0].writeTime.isEqual(new src_1.Timestamp(0, 0))).to.be.true;
        chai_1.expect(writeResults[1].writeTime.isEqual(new src_1.Timestamp(1, 1))).to.be.true;
        chai_1.expect(writeResults[2].writeTime.isEqual(new src_1.Timestamp(2, 2))).to.be.true;
        chai_1.expect(writeResults[3].writeTime.isEqual(new src_1.Timestamp(3, 3))).to.be.true;
    }
    it('accepts multiple operations', () => {
        const documentName = firestore.doc('col/doc');
        writeBatch.set(documentName, { foo: src_1.FieldValue.serverTimestamp() });
        writeBatch.update(documentName, { foo: 'bar' });
        writeBatch.create(documentName, {});
        writeBatch.delete(documentName);
        return writeBatch.commit().then(resp => {
            verifyResponse(resp);
        });
    });
    it('chains multiple operations', () => {
        const documentName = firestore.doc('col/doc');
        return writeBatch
            .set(documentName, { foo: src_1.FieldValue.serverTimestamp() })
            .update(documentName, { foo: 'bar' })
            .create(documentName, {})
            .delete(documentName)
            .commit()
            .then(resp => {
            verifyResponse(resp);
        });
    });
    it('handles exception', () => {
        firestore.request = () => {
            return Promise.reject(new Error('Expected exception'));
        };
        return firestore
            .batch()
            .commit()
            .then(() => {
            throw new Error('Unexpected success in Promise');
        })
            .catch(err => {
            chai_1.expect(err.message).to.equal('Expected exception');
        });
    });
    it('cannot append to committed batch', () => {
        const documentName = firestore.doc('col/doc');
        const batch = firestore.batch();
        batch.set(documentName, { foo: src_1.FieldValue.serverTimestamp() });
        batch.update(documentName, { foo: 'bar' });
        batch.create(documentName, {});
        batch.delete(documentName);
        const promise = batch.commit();
        chai_1.expect(() => {
            batch.set(documentName, {});
        }).to.throw('Cannot modify a WriteBatch that has been committed.');
        return promise;
    });
    it('can reset a committed batch', async () => {
        const documentName = firestore.doc('col/doc');
        const batch = firestore.batch();
        batch.set(documentName, { foo: src_1.FieldValue.serverTimestamp() });
        batch.update(documentName, { foo: 'bar' });
        batch.create(documentName, {});
        batch.delete(documentName);
        await batch.commit();
        batch._reset();
        batch.set(documentName, { foo: src_1.FieldValue.serverTimestamp() });
        batch.update(documentName, { foo: 'bar' });
        batch.create(documentName, {});
        batch.delete(documentName);
        await batch.commit();
    });
    it('can commit an unmodified batch multiple times', () => {
        const documentName = firestore.doc('col/doc');
        const batch = firestore.batch();
        batch.set(documentName, { foo: src_1.FieldValue.serverTimestamp() });
        batch.update(documentName, { foo: 'bar' });
        batch.create(documentName, {});
        batch.delete(documentName);
        return batch.commit().then(() => batch.commit);
    });
    it('can return same write result', () => {
        const overrides = {
            commit: request => {
                return helpers_1.response({
                    commitTime: {
                        nanos: 0,
                        seconds: 0,
                    },
                    writeResults: [
                        {
                            updateTime: {
                                nanos: 0,
                                seconds: 0,
                            },
                        },
                        {
                            updateTime: {},
                        },
                    ],
                });
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            const documentName = firestore.doc('col/doc');
            const batch = firestore.batch();
            batch.set(documentName, {});
            batch.set(documentName, {});
            return batch.commit().then(results => {
                chai_1.expect(results[0].isEqual(results[1])).to.be.true;
            });
        });
    });
    it('uses transactions on GCF', () => {
        // We use this environment variable during initialization to detect whether
        // we are running on GCF.
        process.env.FUNCTION_TRIGGER_TYPE = 'http-trigger';
        let beginCalled = 0;
        let commitCalled = 0;
        const overrides = {
            beginTransaction: () => {
                ++beginCalled;
                return helpers_1.response({ transaction: Buffer.from('foo') });
            },
            commit: () => {
                ++commitCalled;
                return helpers_1.response({
                    commitTime: {
                        nanos: 0,
                        seconds: 0,
                    },
                });
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            firestore['_preferTransactions'] = true;
            firestore['_lastSuccessfulRequest'] = 0;
            return firestore
                .batch()
                .commit()
                .then(() => {
                // The first commit always uses a transcation.
                chai_1.expect(beginCalled).to.equal(1);
                chai_1.expect(commitCalled).to.equal(1);
                return firestore.batch().commit();
            })
                .then(() => {
                // The following commits don't use transactions if they happen
                // within two minutes.
                chai_1.expect(beginCalled).to.equal(1);
                chai_1.expect(commitCalled).to.equal(2);
                firestore['_lastSuccessfulRequest'] = 1337;
                return firestore.batch().commit();
            })
                .then(() => {
                chai_1.expect(beginCalled).to.equal(2);
                chai_1.expect(commitCalled).to.equal(3);
                delete process.env.FUNCTION_TRIGGER_TYPE;
            });
        });
    });
});
//# sourceMappingURL=write-batch.js.map