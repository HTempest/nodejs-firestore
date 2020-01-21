"use strict";
// Copyright 2017 Google LLC
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
const extend = require("extend");
const google_gax_1 = require("google-gax");
const through2 = require("through2");
const Firestore = require("../src");
const src_1 = require("../src");
const helpers_1 = require("./util/helpers");
chai_1.use(chaiAsPromised);
const PROJECT_ID = 'test-project';
const DATABASE_ROOT = `projects/${PROJECT_ID}/databases/(default)`;
const COLLECTION_ROOT = `${DATABASE_ROOT}/documents/collectionId`;
const DOCUMENT_NAME = `${COLLECTION_ROOT}/documentId`;
// Change the argument to 'console.log' to enable debug output.
Firestore.setLogFunction(() => { });
/** Helper to create a transaction ID from either a string or a Uint8Array. */
function transactionId(transaction) {
    if (transaction === undefined) {
        return Buffer.from('foo');
    }
    else if (typeof transaction === 'string') {
        return Buffer.from(transaction);
    }
    else {
        return transaction;
    }
}
function commit(transaction, writes, error) {
    const proto = {
        database: DATABASE_ROOT,
        transaction: transactionId(transaction),
    };
    proto.writes = writes || [];
    const response = {
        commitTime: {
            nanos: 0,
            seconds: 0,
        },
        writeResults: [],
    };
    for (let i = 0; i < proto.writes.length; ++i) {
        response.writeResults.push({
            updateTime: {
                nanos: 0,
                seconds: 0,
            },
        });
    }
    return {
        type: 'commit',
        request: proto,
        error,
        response,
    };
}
function rollback(transaction, error) {
    const proto = {
        database: DATABASE_ROOT,
        transaction: transactionId(transaction),
    };
    return {
        type: 'rollback',
        request: proto,
        error,
        response: {},
    };
}
function begin(transaction, prevTransaction, error) {
    const proto = { database: DATABASE_ROOT };
    if (prevTransaction) {
        proto.options = {
            readWrite: {
                retryTransaction: transactionId(prevTransaction),
            },
        };
    }
    const response = {
        transaction: transactionId(transaction),
    };
    return {
        type: 'begin',
        request: proto,
        error,
        response,
    };
}
function getDocument(transaction, error) {
    const request = {
        database: DATABASE_ROOT,
        documents: [DOCUMENT_NAME],
        transaction: transactionId(transaction),
    };
    const stream = through2.obj();
    setImmediate(() => {
        stream.push({
            found: {
                name: DOCUMENT_NAME,
                createTime: { seconds: 1, nanos: 2 },
                updateTime: { seconds: 3, nanos: 4 },
            },
            readTime: { seconds: 5, nanos: 6 },
        });
        stream.push(null);
    });
    return {
        type: 'getDocument',
        request,
        error,
        stream,
    };
}
function getAll(docs, fieldMask) {
    const request = {
        database: DATABASE_ROOT,
        documents: [],
        transaction: Buffer.from('foo'),
    };
    if (fieldMask) {
        request.mask = { fieldPaths: fieldMask };
    }
    const stream = through2.obj();
    for (const doc of docs) {
        const name = `${COLLECTION_ROOT}/${doc}`;
        request.documents.push(name);
        setImmediate(() => {
            stream.push({
                found: {
                    name,
                    createTime: { seconds: 1, nanos: 2 },
                    updateTime: { seconds: 3, nanos: 4 },
                },
                readTime: { seconds: 5, nanos: 6 },
            });
        });
    }
    setImmediate(() => {
        stream.push(null);
    });
    return {
        type: 'getDocument',
        request,
        stream,
    };
}
function query(transaction) {
    const request = {
        parent: `${DATABASE_ROOT}/documents`,
        structuredQuery: {
            from: [
                {
                    collectionId: 'collectionId',
                },
            ],
            where: {
                fieldFilter: {
                    field: {
                        fieldPath: 'foo',
                    },
                    op: 'EQUAL',
                    value: {
                        stringValue: 'bar',
                    },
                },
            },
        },
        transaction: transaction || Buffer.from('foo'),
    };
    const stream = through2.obj();
    setImmediate(() => {
        stream.push({
            document: {
                name: DOCUMENT_NAME,
                createTime: { seconds: 1, nanos: 2 },
                updateTime: { seconds: 3, nanos: 4 },
            },
            readTime: { seconds: 5, nanos: 6 },
        });
        stream.push(null);
    });
    return {
        type: 'query',
        request,
        stream,
    };
}
/**
 * Asserts that the given transaction function issues the expected requests.
 */
function runTransaction(transactionCallback, ...expectedRequests) {
    const overrides = {
        beginTransaction: actual => {
            const request = expectedRequests.shift();
            chai_1.expect(request.type).to.equal('begin');
            chai_1.expect(actual).to.deep.eq(request.request);
            if (request.error) {
                return Promise.reject(request.error);
            }
            else {
                return helpers_1.response(request.response);
            }
        },
        commit: actual => {
            const request = expectedRequests.shift();
            chai_1.expect(request.type).to.equal('commit');
            chai_1.expect(actual).to.deep.eq(request.request);
            if (request.error) {
                return Promise.reject(request.error);
            }
            else {
                return helpers_1.response(request.response);
            }
        },
        rollback: actual => {
            const request = expectedRequests.shift();
            chai_1.expect(request.type).to.equal('rollback');
            chai_1.expect(actual).to.deep.eq(request.request);
            if (request.error) {
                return Promise.reject(request.error);
            }
            else {
                return helpers_1.response({});
            }
        },
        batchGetDocuments: actual => {
            const request = expectedRequests.shift();
            chai_1.expect(request.type).to.equal('getDocument');
            chai_1.expect(actual).to.deep.eq(request.request);
            if (request.error) {
                throw request.error;
            }
            else {
                return request.stream;
            }
        },
        runQuery: actual => {
            const request = expectedRequests.shift();
            chai_1.expect(request.type).to.equal('query');
            actual = extend(true, {}, actual); // Remove undefined properties
            chai_1.expect(actual).to.deep.eq(request.request);
            return request.stream;
        },
    };
    return helpers_1.createInstance(overrides).then(firestore => {
        return firestore
            .runTransaction(transaction => {
            const docRef = firestore.doc('collectionId/documentId');
            return transactionCallback(transaction, docRef);
        })
            .then(val => {
            chai_1.expect(expectedRequests.length).to.equal(0);
            return val;
        })
            .catch(err => {
            chai_1.expect(expectedRequests.length).to.equal(0);
            return Promise.reject(err);
        });
    });
}
describe('successful transactions', () => {
    it('empty transaction', () => {
        return runTransaction(() => {
            return Promise.resolve();
        }, begin(), commit());
    });
    it('returns value', () => {
        return runTransaction(() => {
            return Promise.resolve('bar');
        }, begin(), commit()).then(val => {
            chai_1.expect(val).to.equal('bar');
        });
    });
});
describe('failed transactions', () => {
    it('requires update function', () => {
        const overrides = {
            beginTransaction: () => Promise.reject(),
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            chai_1.expect(() => firestore.runTransaction()).to.throw('Value for argument "updateFunction" is not a valid function.');
        });
    });
    it('requires valid retry number', () => {
        const overrides = {
            beginTransaction: () => Promise.reject(),
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            chai_1.expect(() => firestore.runTransaction(() => Promise.resolve(), {
                maxAttempts: 'foo',
            })).to.throw('Value for argument "transactionOptions.maxAttempts" is not a valid integer.');
            chai_1.expect(() => firestore.runTransaction(() => Promise.resolve(), { maxAttempts: 0 })).to.throw('Value for argument "transactionOptions.maxAttempts" must be within [1, Infinity] inclusive, but was: 0');
        });
    });
    it('requires a promise', () => {
        return chai_1.expect(runTransaction((() => { }), begin(), rollback())).to.eventually.be.rejectedWith('You must return a Promise in your transaction()-callback.');
    });
    it('handles exception', () => {
        return helpers_1.createInstance().then(firestore => {
            firestore.request = () => {
                return Promise.reject(new Error('Expected exception'));
            };
            return chai_1.expect(firestore.runTransaction(() => {
                return Promise.resolve();
            })).to.eventually.be.rejectedWith('Expected exception');
        });
    });
    it('retries GRPC exceptions with code ABORTED in callback', () => {
        const retryableError = new google_gax_1.GoogleError('Aborted');
        retryableError.code = google_gax_1.Status.ABORTED;
        return runTransaction(async (transaction, docRef) => {
            await transaction.get(docRef);
            return 'success';
        }, begin('foo1'), getDocument('foo1', retryableError), rollback('foo1'), begin('foo2', 'foo1'), getDocument('foo2'), commit('foo2')).then(res => {
            chai_1.expect(res).to.equal('success');
        });
    });
    it("doesn't retry GRPC exceptions with code FAILED_PRECONDITION in callback", () => {
        const nonRetryableError = new google_gax_1.GoogleError('Failed Precondition');
        nonRetryableError.code = google_gax_1.Status.FAILED_PRECONDITION;
        return chai_1.expect(runTransaction(async (transaction, docRef) => {
            await transaction.get(docRef);
            return 'failure';
        }, begin('foo'), getDocument('foo', nonRetryableError), rollback('foo'))).to.eventually.be.rejectedWith('Failed Precondition');
    });
    it("doesn't retry custom user exceptions in callback", () => {
        return chai_1.expect(runTransaction(() => {
            return Promise.reject('request exception');
        }, begin(), rollback())).to.eventually.be.rejectedWith('request exception');
    });
    it('retries on commit failure', () => {
        const userResult = ['failure', 'failure', 'success'];
        const serverError = new Error('Retryable error');
        return runTransaction(() => {
            return Promise.resolve(userResult.shift());
        }, begin('foo1'), commit('foo1', [], serverError), begin('foo2', 'foo1'), commit('foo2', [], serverError), begin('foo3', 'foo2'), commit('foo3')).then(res => {
            chai_1.expect(res).to.equal('success');
        });
    });
    it('limits the retry attempts', () => {
        const err = new google_gax_1.GoogleError('Server disconnect');
        err.code = google_gax_1.Status.UNAVAILABLE;
        return chai_1.expect(runTransaction(() => {
            return Promise.resolve('success');
        }, begin('foo1'), commit('foo1', [], err), begin('foo2', 'foo1'), commit('foo2', [], err), begin('foo3', 'foo2'), commit('foo3', [], err), begin('foo4', 'foo3'), commit('foo4', [], err), begin('foo5', 'foo4'), commit('foo5', [], new Error('Final exception')))).to.eventually.be.rejectedWith('Final exception');
    });
    it('fails on rollback', () => {
        return chai_1.expect(runTransaction(() => {
            return Promise.reject();
        }, begin(), rollback('foo', new Error('Fails on rollback')))).to.eventually.be.rejectedWith('Fails on rollback');
    });
});
describe('transaction operations', () => {
    it('support get with document ref', () => {
        return runTransaction((transaction, docRef) => {
            return transaction.get(docRef).then(doc => {
                chai_1.expect(doc.id).to.equal('documentId');
            });
        }, begin(), getDocument(), commit());
    });
    it('requires a query or document for get', () => {
        return runTransaction((transaction) => {
            chai_1.expect(() => transaction.get()).to.throw('Value for argument "refOrQuery" must be a DocumentReference or a Query.');
            chai_1.expect(() => transaction.get('foo')).to.throw('Value for argument "refOrQuery" must be a DocumentReference or a Query.');
            return Promise.resolve();
        }, begin(), commit());
    });
    it('enforce that gets come before writes', () => {
        return chai_1.expect(runTransaction((transaction, docRef) => {
            transaction.set(docRef, { foo: 'bar' });
            return transaction.get(docRef);
        }, begin(), rollback())).to.eventually.be.rejectedWith('Firestore transactions require all reads to be executed before all writes.');
    });
    it('support get with query', () => {
        return runTransaction((transaction, docRef) => {
            const query = docRef.parent.where('foo', '==', 'bar');
            return transaction.get(query).then(results => {
                chai_1.expect(results.docs[0].id).to.equal('documentId');
            });
        }, begin(), query(), commit());
    });
    it('support getAll', () => {
        return runTransaction((transaction, docRef) => {
            const firstDoc = docRef.parent.doc('firstDocument');
            const secondDoc = docRef.parent.doc('secondDocument');
            return transaction.getAll(firstDoc, secondDoc).then(docs => {
                chai_1.expect(docs.length).to.equal(2);
                chai_1.expect(docs[0].id).to.equal('firstDocument');
                chai_1.expect(docs[1].id).to.equal('secondDocument');
            });
        }, begin(), getAll(['firstDocument', 'secondDocument']), commit());
    });
    it('support getAll with field mask', () => {
        return runTransaction((transaction, docRef) => {
            const doc = docRef.parent.doc('doc');
            return transaction.getAll(doc, {
                fieldMask: ['a.b', new src_1.FieldPath('a.b')],
            });
        }, begin(), getAll(['doc'], ['a.b', '`a.b`']), commit());
    });
    it('enforce that getAll come before writes', () => {
        return chai_1.expect(runTransaction((transaction, docRef) => {
            transaction.set(docRef, { foo: 'bar' });
            return transaction.getAll(docRef);
        }, begin(), rollback())).to.eventually.be.rejectedWith('Firestore transactions require all reads to be executed before all writes.');
    });
    it('support create', () => {
        const create = {
            currentDocument: {
                exists: false,
            },
            update: {
                fields: {},
                name: DOCUMENT_NAME,
            },
        };
        return runTransaction((transaction, docRef) => {
            transaction.create(docRef, {});
            return Promise.resolve();
        }, begin(), commit(undefined, [create]));
    });
    it('support update', () => {
        const update = {
            currentDocument: {
                exists: true,
            },
            update: {
                fields: {
                    a: {
                        mapValue: {
                            fields: {
                                b: {
                                    stringValue: 'c',
                                },
                            },
                        },
                    },
                },
                name: DOCUMENT_NAME,
            },
            updateMask: {
                fieldPaths: ['a.b'],
            },
        };
        return runTransaction((transaction, docRef) => {
            transaction.update(docRef, { 'a.b': 'c' });
            transaction.update(docRef, 'a.b', 'c');
            transaction.update(docRef, new Firestore.FieldPath('a', 'b'), 'c');
            return Promise.resolve();
        }, begin(), commit(undefined, [update, update, update]));
    });
    it('support set', () => {
        const set = {
            update: {
                fields: {
                    'a.b': {
                        stringValue: 'c',
                    },
                },
                name: DOCUMENT_NAME,
            },
        };
        return runTransaction((transaction, docRef) => {
            transaction.set(docRef, { 'a.b': 'c' });
            return Promise.resolve();
        }, begin(), commit(undefined, [set]));
    });
    it('support set with merge', () => {
        const set = {
            update: {
                fields: {
                    'a.b': {
                        stringValue: 'c',
                    },
                },
                name: DOCUMENT_NAME,
            },
            updateMask: {
                fieldPaths: ['`a.b`'],
            },
        };
        return runTransaction((transaction, docRef) => {
            transaction.set(docRef, { 'a.b': 'c' }, { merge: true });
            return Promise.resolve();
        }, begin(), commit(undefined, [set]));
    });
    it('support delete', () => {
        const remove = {
            delete: DOCUMENT_NAME,
        };
        return runTransaction((transaction, docRef) => {
            transaction.delete(docRef);
            return Promise.resolve();
        }, begin(), commit(undefined, [remove]));
    });
    it('support multiple writes', () => {
        const remove = {
            delete: DOCUMENT_NAME,
        };
        const set = {
            update: {
                fields: {},
                name: DOCUMENT_NAME,
            },
        };
        return runTransaction((transaction, docRef) => {
            transaction.delete(docRef).set(docRef, {});
            return Promise.resolve();
        }, begin(), commit(undefined, [remove, set]));
    });
});
//# sourceMappingURL=transaction.js.map