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
const extend = require("extend");
const src_1 = require("../src");
const src_2 = require("../src");
const backoff_1 = require("../src/backoff");
const document_1 = require("../src/document");
const path_1 = require("../src/path");
const helpers_1 = require("./util/helpers");
const PROJECT_ID = 'test-project';
const DATABASE_ROOT = `projects/${PROJECT_ID}/databases/(default)`;
// Change the argument to 'console.log' to enable debug output.
src_1.setLogFunction(() => { });
function snapshot(relativePath, data) {
    return helpers_1.createInstance().then(firestore => {
        const path = path_1.QualifiedResourcePath.fromSlashSeparatedString(`${DATABASE_ROOT}/documents/${relativePath}`);
        const ref = new src_2.DocumentReference(firestore, path);
        const snapshot = new document_1.DocumentSnapshotBuilder(ref);
        snapshot.fieldsProto = firestore['_serializer'].encodeFields(data);
        snapshot.readTime = src_2.Timestamp.fromMillis(0);
        snapshot.createTime = src_2.Timestamp.fromMillis(0);
        snapshot.updateTime = src_2.Timestamp.fromMillis(0);
        return snapshot.build();
    });
}
function fieldFilters(fieldPath, op, value, ...fieldPathOpAndValues) {
    const filters = [];
    for (let i = 0; i < arguments.length; i += 3) {
        fieldPath = arguments[i];
        op = arguments[i + 1];
        value = arguments[i + 2];
        const filter = {
            field: {
                fieldPath,
            },
            op,
        };
        if (typeof value === 'string') {
            filter.value = { stringValue: value };
        }
        else {
            filter.value = value;
        }
        filters.push({ fieldFilter: filter });
    }
    if (filters.length === 1) {
        return {
            where: {
                fieldFilter: filters[0].fieldFilter,
            },
        };
    }
    else {
        return {
            where: {
                compositeFilter: {
                    op: 'AND',
                    filters,
                },
            },
        };
    }
}
function unaryFilters(fieldPath, equals, ...fieldPathsAndEquals) {
    const filters = [];
    fieldPathsAndEquals.unshift(fieldPath, equals);
    for (let i = 0; i < fieldPathsAndEquals.length; i += 2) {
        const fieldPath = fieldPathsAndEquals[i];
        const equals = fieldPathsAndEquals[i + 1];
        chai_1.expect(equals).to.be.oneOf(['IS_NAN', 'IS_NULL']);
        filters.push({
            unaryFilter: {
                field: {
                    fieldPath,
                },
                op: equals,
            },
        });
    }
    if (filters.length === 1) {
        return {
            where: {
                unaryFilter: filters[0].unaryFilter,
            },
        };
    }
    else {
        return {
            where: {
                compositeFilter: {
                    op: 'AND',
                    filters,
                },
            },
        };
    }
}
function orderBy(fieldPath, direction, ...fieldPathAndOrderBys) {
    const orderBy = [];
    fieldPathAndOrderBys.unshift(fieldPath, direction);
    for (let i = 0; i < fieldPathAndOrderBys.length; i += 2) {
        const fieldPath = fieldPathAndOrderBys[i];
        const direction = fieldPathAndOrderBys[i + 1];
        orderBy.push({
            field: {
                fieldPath,
            },
            direction,
        });
    }
    return { orderBy };
}
function limit(n) {
    return {
        limit: {
            value: n,
        },
    };
}
function offset(n) {
    return {
        offset: n,
    };
}
function allDescendants() {
    return { from: [{ collectionId: 'collectionId', allDescendants: true }] };
}
function select(...fields) {
    const select = {
        fields: [],
    };
    for (const field of fields) {
        select.fields.push({ fieldPath: field });
    }
    return { select };
}
function startAt(before, ...values) {
    const cursor = {
        values: [],
    };
    if (before) {
        cursor.before = true;
    }
    for (const value of values) {
        if (typeof value === 'string') {
            cursor.values.push({
                stringValue: value,
            });
        }
        else {
            cursor.values.push(value);
        }
    }
    return { startAt: cursor };
}
function endAt(before, ...values) {
    const cursor = {
        values: [],
    };
    if (before) {
        cursor.before = true;
    }
    for (const value of values) {
        if (typeof value === 'string') {
            cursor.values.push({
                stringValue: value,
            });
        }
        else {
            cursor.values.push(value);
        }
    }
    return { endAt: cursor };
}
function queryEquals(actual, ...protoComponents) {
    chai_1.expect(actual).to.not.be.undefined;
    const query = {
        parent: DATABASE_ROOT + '/documents',
        structuredQuery: {
            from: [
                {
                    collectionId: 'collectionId',
                },
            ],
        },
    };
    for (const protoComponent of protoComponents) {
        extend(true, query.structuredQuery, protoComponent);
    }
    // 'extend' removes undefined fields in the request object. The backend
    // ignores these fields, but we need to manually strip them before we compare
    // the expected and the actual request.
    actual = extend(true, {}, actual);
    chai_1.expect(actual).to.deep.eq(query);
}
function result(documentId) {
    return { document: helpers_1.document(documentId), readTime: { seconds: 5, nanos: 6 } };
}
exports.result = result;
describe('query interface', () => {
    let firestore;
    beforeEach(() => {
        backoff_1.setTimeoutHandler(setImmediate);
        return helpers_1.createInstance().then(firestoreInstance => {
            firestore = firestoreInstance;
        });
    });
    afterEach(() => {
        helpers_1.verifyInstance(firestore);
        backoff_1.setTimeoutHandler(setTimeout);
    });
    it('has isEqual() method', () => {
        const query = firestore.collection('collectionId');
        const queryEquals = (equals, notEquals) => {
            for (let i = 0; i < equals.length; ++i) {
                for (const equal of equals) {
                    chai_1.expect(equals[i].isEqual(equal)).to.be.true;
                    chai_1.expect(equal.isEqual(equals[i])).to.be.true;
                }
                for (const notEqual of notEquals) {
                    chai_1.expect(equals[i].isEqual(notEqual)).to.be.false;
                    chai_1.expect(notEqual.isEqual(equals[i])).to.be.false;
                }
            }
        };
        queryEquals([query.where('a', '==', '1'), query.where('a', '==', '1')], [query.where('a', '=', 1)]);
        queryEquals([
            query.orderBy('__name__'),
            query.orderBy('__name__', 'asc'),
            query.orderBy('__name__', 'ASC'),
            query.orderBy(src_1.FieldPath.documentId()),
        ], [query.orderBy('foo'), query.orderBy(src_1.FieldPath.documentId(), 'desc')]);
        queryEquals([query.limit(0), query.limit(0).limit(0)], [query, query.limit(10)]);
        queryEquals([query.offset(0), query.offset(0).offset(0)], [query, query.offset(10)]);
        queryEquals([query.orderBy('foo').startAt('a'), query.orderBy('foo').startAt('a')], [
            query.orderBy('foo').startAfter('a'),
            query.orderBy('foo').endAt('a'),
            query.orderBy('foo').endBefore('a'),
            query.orderBy('foo').startAt('b'),
            query.orderBy('bar').startAt('a'),
        ]);
        queryEquals([
            query.orderBy('foo').startAfter('a'),
            query.orderBy('foo').startAfter('a'),
        ], [
            query.orderBy('foo').startAfter('b'),
            query.orderBy('bar').startAfter('a'),
        ]);
        queryEquals([
            query.orderBy('foo').endBefore('a'),
            query.orderBy('foo').endBefore('a'),
        ], [query.orderBy('foo').endBefore('b'), query.orderBy('bar').endBefore('a')]);
        queryEquals([query.orderBy('foo').endAt('a'), query.orderBy('foo').endAt('a')], [query.orderBy('foo').endAt('b'), query.orderBy('bar').endAt('a')]);
        queryEquals([
            query
                .orderBy('foo')
                .orderBy('__name__')
                .startAt('b', 'c'),
            query
                .orderBy('foo')
                .orderBy('__name__')
                .startAt('b', 'c'),
        ], []);
    });
    it('accepts all variations', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, fieldFilters('foo', 'EQUAL', 'bar'), orderBy('foo', 'ASCENDING'), limit(10));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query.where('foo', '==', 'bar');
            query = query.orderBy('foo');
            query = query.limit(10);
            return query.get().then(results => {
                chai_1.expect(results.query).to.equal(query);
                chai_1.expect(results.size).to.equal(0);
                chai_1.expect(results.empty).to.be.true;
            });
        });
    });
    it('supports empty gets', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request);
                return helpers_1.stream({ readTime: { seconds: 5, nanos: 6 } });
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            const query = firestore.collection('collectionId');
            return query.get().then(results => {
                chai_1.expect(results.size).to.equal(0);
                chai_1.expect(results.empty).to.be.true;
                chai_1.expect(results.readTime.isEqual(new src_2.Timestamp(5, 6))).to.be.true;
            });
        });
    });
    it('retries on stream failure', () => {
        let attempts = 0;
        const overrides = {
            runQuery: request => {
                ++attempts;
                throw new Error('Expected error');
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            const query = firestore.collection('collectionId');
            return query
                .get()
                .then(() => {
                throw new Error('Unexpected success');
            })
                .catch(() => {
                chai_1.expect(attempts).to.equal(5);
            });
        });
    });
    it('supports empty streams', callback => {
        const overrides = {
            runQuery: request => {
                queryEquals(request);
                return helpers_1.stream({ readTime: { seconds: 5, nanos: 6 } });
            },
        };
        helpers_1.createInstance(overrides).then(firestore => {
            const query = firestore.collection('collectionId');
            query
                .stream()
                .on('data', () => {
                throw new Error('Unexpected document');
            })
                .on('end', () => {
                callback();
            });
        });
    });
    it('returns results', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request);
                return helpers_1.stream(result('first'), result('second'));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            const query = firestore.collection('collectionId');
            return query.get().then(results => {
                chai_1.expect(results.size).to.equal(2);
                chai_1.expect(results.empty).to.be.false;
                chai_1.expect(results.readTime.isEqual(new src_2.Timestamp(5, 6))).to.be.true;
                chai_1.expect(results.docs[0].id).to.equal('first');
                chai_1.expect(results.docs[1].id).to.equal('second');
                chai_1.expect(results.docChanges()).to.have.length(2);
                let count = 0;
                results.forEach(doc => {
                    chai_1.expect(doc instanceof document_1.DocumentSnapshot).to.be.true;
                    chai_1.expect(doc.createTime.isEqual(new src_2.Timestamp(1, 2))).to.be.true;
                    chai_1.expect(doc.updateTime.isEqual(new src_2.Timestamp(3, 4))).to.be.true;
                    chai_1.expect(doc.readTime.isEqual(new src_2.Timestamp(5, 6))).to.be.true;
                    ++count;
                });
                chai_1.expect(2).to.equal(count);
            });
        });
    });
    it('handles stream exception at initialization', () => {
        const query = firestore.collection('collectionId');
        query._stream = () => {
            throw new Error('Expected error');
        };
        return query
            .get()
            .then(() => {
            throw new Error('Unexpected success in Promise');
        })
            .catch(err => {
            chai_1.expect(err.message).to.equal('Expected error');
        });
    });
    it('handles stream exception during initialization', () => {
        const overrides = {
            runQuery: () => {
                return helpers_1.stream(new Error('Expected error'));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .collection('collectionId')
                .get()
                .then(() => {
                throw new Error('Unexpected success in Promise');
            })
                .catch(err => {
                chai_1.expect(err.message).to.equal('Expected error');
            });
        });
    });
    it('handles stream exception after initialization', () => {
        const overrides = {
            runQuery: () => {
                return helpers_1.stream(result('first'), new Error('Expected error'));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .collection('collectionId')
                .get()
                .then(() => {
                throw new Error('Unexpected success in Promise');
            })
                .catch(err => {
                chai_1.expect(err.message).to.equal('Expected error');
            });
        });
    });
    it('streams results', callback => {
        const overrides = {
            runQuery: request => {
                queryEquals(request);
                return helpers_1.stream(result('first'), result('second'));
            },
        };
        helpers_1.createInstance(overrides).then(firestore => {
            const query = firestore.collection('collectionId');
            let received = 0;
            query
                .stream()
                .on('data', doc => {
                chai_1.expect(doc).to.be.an.instanceOf(document_1.DocumentSnapshot);
                ++received;
            })
                .on('end', () => {
                chai_1.expect(received).to.equal(2);
                callback();
            });
        });
    });
    it('throws if QuerySnapshot.docChanges() is used as a property', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request);
                return helpers_1.stream(result('first'), result('second'));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            const query = firestore.collection('collectionId');
            return query.get().then(snapshot => {
                chai_1.expect(() => {
                    snapshot.docChanges.forEach(() => { });
                }).to.throw('QuerySnapshot.docChanges has been changed from a property into a method');
                chai_1.expect(() => {
                    for (const doc of snapshot.docChanges) {
                    }
                }).to.throw('QuerySnapshot.docChanges has been changed from a property into a method');
            });
        });
    });
    it('for Query.withConverter()', async () => {
        const doc = helpers_1.document('documentId', 'author', 'author', 'title', 'post');
        const overrides = {
            commit: request => {
                const expectedRequest = helpers_1.set({
                    document: doc,
                });
                helpers_1.requestEquals(request, expectedRequest);
                return helpers_1.response(helpers_1.writeResult(1));
            },
            runQuery: request => {
                queryEquals(request, fieldFilters('title', 'EQUAL', 'post'));
                return helpers_1.stream({ document: doc, readTime: { seconds: 5, nanos: 6 } });
            },
        };
        return helpers_1.createInstance(overrides).then(async (firestore) => {
            await firestore
                .collection('collectionId')
                .doc('documentId')
                .set({ title: 'post', author: 'author' });
            const posts = await firestore
                .collection('collectionId')
                .where('title', '==', 'post')
                .withConverter(helpers_1.postConverter)
                .get();
            chai_1.expect(posts.size).to.equal(1);
            chai_1.expect(posts.docs[0].data().toString()).to.equal('post, by author');
        });
    });
});
describe('where() interface', () => {
    let firestore;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreInstance => {
            firestore = firestoreInstance;
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('generates proto', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, fieldFilters('foo', 'EQUAL', 'bar'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query.where('foo', '==', 'bar');
            return query.get();
        });
    });
    it('concatenates all accepted filters', () => {
        const arrValue = {
            arrayValue: {
                values: [
                    {
                        stringValue: 'barArray',
                    },
                ],
            },
        };
        const overrides = {
            runQuery: request => {
                queryEquals(request, fieldFilters('fooSmaller', 'LESS_THAN', 'barSmaller', 'fooSmallerOrEquals', 'LESS_THAN_OR_EQUAL', 'barSmallerOrEquals', 'fooEquals', 'EQUAL', 'barEquals', 'fooEqualsLong', 'EQUAL', 'barEqualsLong', 'fooGreaterOrEquals', 'GREATER_THAN_OR_EQUAL', 'barGreaterOrEquals', 'fooGreater', 'GREATER_THAN', 'barGreater', 'fooContains', 'ARRAY_CONTAINS', 'barContains', 'fooIn', 'IN', arrValue, 'fooContainsAny', 'ARRAY_CONTAINS_ANY', arrValue));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query.where('fooSmaller', '<', 'barSmaller');
            query = query.where('fooSmallerOrEquals', '<=', 'barSmallerOrEquals');
            query = query.where('fooEquals', '=', 'barEquals');
            query = query.where('fooEqualsLong', '==', 'barEqualsLong');
            query = query.where('fooGreaterOrEquals', '>=', 'barGreaterOrEquals');
            query = query.where('fooGreater', '>', 'barGreater');
            query = query.where('fooContains', 'array-contains', 'barContains');
            query = query.where('fooIn', 'in', ['barArray']);
            query = query.where('fooContainsAny', 'array-contains-any', ['barArray']);
            return query.get();
        });
    });
    it('accepts object', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, fieldFilters('foo', 'EQUAL', {
                    mapValue: {
                        fields: {
                            foo: { stringValue: 'bar' },
                        },
                    },
                }));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query.where('foo', '==', { foo: 'bar' });
            return query.get();
        });
    });
    it('supports field path objects for field paths', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, fieldFilters('foo.bar', 'EQUAL', 'foobar', 'bar.foo', 'EQUAL', 'foobar'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query.where('foo.bar', '==', 'foobar');
            query = query.where(new src_1.FieldPath('bar', 'foo'), '==', 'foobar');
            return query.get();
        });
    });
    it('supports strings for FieldPath.documentId()', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, fieldFilters('__name__', 'EQUAL', {
                    referenceValue: `projects/${PROJECT_ID}/databases/(default)/` +
                        'documents/collectionId/foo',
                }));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query.where(src_1.FieldPath.documentId(), '==', 'foo');
            return query.get();
        });
    });
    it('rejects custom objects for field paths', () => {
        chai_1.expect(() => {
            let query = firestore.collection('collectionId');
            query = query.where({}, '==', 'bar');
            return query.get();
        }).to.throw('Value for argument "fieldPath" is not a valid field path. Paths can only be specified as strings or via a FieldPath object.');
        class FieldPath {
        }
        chai_1.expect(() => {
            let query = firestore.collection('collectionId');
            query = query.where(new FieldPath(), '==', 'bar');
            return query.get();
        }).to.throw('Detected an object of type "FieldPath" that doesn\'t match the expected instance.');
    });
    it('rejects field paths as value', () => {
        chai_1.expect(() => {
            let query = firestore.collection('collectionId');
            query = query.where('foo', '==', new src_1.FieldPath('bar'));
            return query.get();
        }).to.throw('Value for argument "value" is not a valid query constraint. Cannot use object of type "FieldPath" as a Firestore value.');
    });
    it('rejects field delete as value', () => {
        chai_1.expect(() => {
            let query = firestore.collection('collectionId');
            query = query.where('foo', '==', src_1.FieldValue.delete());
            return query.get();
        }).to.throw('FieldValue.delete() must appear at the top-level and can only be used in update() or set() with {merge:true}.');
    });
    it('rejects custom classes as value', () => {
        class Foo {
        }
        class FieldPath {
        }
        class FieldValue {
        }
        class GeoPoint {
        }
        class DocumentReference {
        }
        const query = firestore.collection('collectionId');
        chai_1.expect(() => {
            query.where('foo', '==', new Foo()).get();
        }).to.throw('Value for argument "value" is not a valid Firestore document. Couldn\'t serialize object of type "Foo". Firestore doesn\'t support JavaScript objects with custom prototypes (i.e. objects that were created via the "new" operator).');
        chai_1.expect(() => {
            query.where('foo', '==', new FieldPath()).get();
        }).to.throw('Detected an object of type "FieldPath" that doesn\'t match the expected instance.');
        chai_1.expect(() => {
            query.where('foo', '==', new FieldValue()).get();
        }).to.throw('Detected an object of type "FieldValue" that doesn\'t match the expected instance.');
        chai_1.expect(() => {
            query.where('foo', '==', new DocumentReference()).get();
        }).to.throw('Detected an object of type "DocumentReference" that doesn\'t match the expected instance.');
        chai_1.expect(() => {
            query.where('foo', '==', new GeoPoint()).get();
        }).to.throw('Detected an object of type "GeoPoint" that doesn\'t match the expected instance.');
    });
    it('supports unary filters', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, unaryFilters('foo', 'IS_NAN', 'bar', 'IS_NULL'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query.where('foo', '==', NaN);
            query = query.where('bar', '==', null);
            return query.get();
        });
    });
    it('rejects invalid NaN filter', () => {
        chai_1.expect(() => {
            let query = firestore.collection('collectionId');
            query = query.where('foo', '>', NaN);
            return query.get();
        }).to.throw('Invalid query. You can only perform equals comparisons on NaN.');
    });
    it('rejects invalid Null filter', () => {
        chai_1.expect(() => {
            let query = firestore.collection('collectionId');
            query = query.where('foo', '>', null);
            return query.get();
        }).to.throw('Invalid query. You can only perform equals comparisons on Null.');
    });
    it('verifies field path', () => {
        let query = firestore.collection('collectionId');
        chai_1.expect(() => {
            query = query.where('foo.', '==', 'foobar');
        }).to.throw('Value for argument "fieldPath" is not a valid field path. Paths must not start or end with ".".');
    });
    it('verifies operator', () => {
        let query = firestore.collection('collectionId');
        chai_1.expect(() => {
            query = query.where('foo', '@', 'foobar');
        }).to.throw('Value for argument "opStr" is invalid. Acceptable values are: <, <=, ==, >, >=, array-contains, in, array-contains-any');
    });
});
describe('orderBy() interface', () => {
    let firestore;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreInstance => {
            firestore = firestoreInstance;
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('accepts empty string', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('foo', 'ASCENDING'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query.orderBy('foo');
            return query.get();
        });
    });
    it('accepts asc', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('foo', 'ASCENDING'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query.orderBy('foo', 'asc');
            return query.get();
        });
    });
    it('accepts desc', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('foo', 'DESCENDING'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query.orderBy('foo', 'desc');
            return query.get();
        });
    });
    it('verifies order', () => {
        let query = firestore.collection('collectionId');
        chai_1.expect(() => {
            query = query.orderBy('foo', 'foo');
        }).to.throw('Value for argument "directionStr" is invalid. Acceptable values are: asc, desc');
    });
    it('accepts field path', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('foo.bar', 'ASCENDING', 'bar.foo', 'ASCENDING'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query.orderBy('foo.bar');
            query = query.orderBy(new src_1.FieldPath('bar', 'foo'));
            return query.get();
        });
    });
    it('verifies field path', () => {
        let query = firestore.collection('collectionId');
        chai_1.expect(() => {
            query = query.orderBy('foo.');
        }).to.throw('Value for argument "fieldPath" is not a valid field path. Paths must not start or end with ".".');
    });
    it('rejects call after cursor', () => {
        let query = firestore.collection('collectionId');
        return snapshot('collectionId/doc', { foo: 'bar' }).then(snapshot => {
            chai_1.expect(() => {
                query = query
                    .orderBy('foo')
                    .startAt('foo')
                    .orderBy('foo');
            }).to.throw('Cannot specify an orderBy() constraint after calling startAt(), startAfter(), endBefore() or endAt().');
            chai_1.expect(() => {
                query = query
                    .where('foo', '>', 'bar')
                    .startAt(snapshot)
                    .where('foo', '>', 'bar');
            }).to.throw('Cannot specify a where() filter after calling startAt(), startAfter(), endBefore() or endAt().');
            chai_1.expect(() => {
                query = query
                    .orderBy('foo')
                    .endAt('foo')
                    .orderBy('foo');
            }).to.throw('Cannot specify an orderBy() constraint after calling startAt(), startAfter(), endBefore() or endAt().');
            chai_1.expect(() => {
                query = query
                    .where('foo', '>', 'bar')
                    .endAt(snapshot)
                    .where('foo', '>', 'bar');
            }).to.throw('Cannot specify a where() filter after calling startAt(), startAfter(), endBefore() or endAt().');
        });
    });
    it('concatenates orders', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('foo', 'ASCENDING', 'bar', 'DESCENDING', 'foobar', 'ASCENDING'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query
                .orderBy('foo', 'asc')
                .orderBy('bar', 'desc')
                .orderBy('foobar');
            return query.get();
        });
    });
});
describe('limit() interface', () => {
    let firestore;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreInstance => {
            firestore = firestoreInstance;
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('generates proto', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, limit(10));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query.limit(10);
            return query.get();
        });
    });
    it('expects number', () => {
        const query = firestore.collection('collectionId');
        chai_1.expect(() => query.limit(Infinity)).to.throw('Value for argument "limit" is not a valid integer.');
    });
    it('uses latest limit', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, limit(3));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query
                .limit(1)
                .limit(2)
                .limit(3);
            return query.get();
        });
    });
});
describe('offset() interface', () => {
    let firestore;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreInstance => {
            firestore = firestoreInstance;
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('generates proto', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, offset(10));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query.offset(10);
            return query.get();
        });
    });
    it('expects number', () => {
        const query = firestore.collection('collectionId');
        chai_1.expect(() => query.offset(Infinity)).to.throw('Value for argument "offset" is not a valid integer.');
    });
    it('uses latest offset', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, offset(3));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query
                .offset(1)
                .offset(2)
                .offset(3);
            return query.get();
        });
    });
});
describe('select() interface', () => {
    let firestore;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreInstance => {
            firestore = firestoreInstance;
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('generates proto', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, select('a', 'b.c'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            const collection = firestore.collection('collectionId');
            const query = collection.select('a', new src_1.FieldPath('b', 'c'));
            return query.get().then(() => {
                return collection.select('a', 'b.c').get();
            });
        });
    });
    it('validates field path', () => {
        const query = firestore.collection('collectionId');
        chai_1.expect(() => query.select(1)).to.throw('Element at index 0 is not a valid field path. Paths can only be specified as strings or via a FieldPath object.');
        chai_1.expect(() => query.select('.')).to.throw('Element at index 0 is not a valid field path. Paths must not start or end with ".".');
    });
    it('uses latest field mask', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, select('bar'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query.select('foo').select('bar');
            return query.get();
        });
    });
    it('implicitly adds FieldPath.documentId()', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, select('__name__'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query.select();
            return query.get();
        });
    });
});
describe('startAt() interface', () => {
    let firestore;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreInstance => {
            firestore = firestoreInstance;
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('accepts fields', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('foo', 'ASCENDING', 'bar', 'ASCENDING'), startAt(true, 'foo', 'bar'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query
                .orderBy('foo')
                .orderBy('bar')
                .startAt('foo', 'bar');
            return query.get();
        });
    });
    it('accepts FieldPath.documentId()', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('__name__', 'ASCENDING'), startAt(true, {
                    referenceValue: `projects/${PROJECT_ID}/databases/(default)/` +
                        'documents/collectionId/doc',
                }));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return snapshot('collectionId/doc', { foo: 'bar' }).then(doc => {
                const query = firestore.collection('collectionId');
                return Promise.all([
                    query
                        .orderBy(src_1.FieldPath.documentId())
                        .startAt(doc.id)
                        .get(),
                    query
                        .orderBy(src_1.FieldPath.documentId())
                        .startAt(doc.ref)
                        .get(),
                ]);
            });
        });
    });
    it('validates value for FieldPath.documentId()', () => {
        const query = firestore.collection('coll/doc/coll');
        chai_1.expect(() => {
            query.orderBy(src_1.FieldPath.documentId()).startAt(42);
        }).to.throw('The corresponding value for FieldPath.documentId() must be a string or a DocumentReference.');
        chai_1.expect(() => {
            query
                .orderBy(src_1.FieldPath.documentId())
                .startAt(firestore.doc('coll/doc/other/doc'));
        }).to.throw('"coll/doc/other/doc" is not part of the query result set and cannot be used as a query boundary.');
        chai_1.expect(() => {
            query
                .orderBy(src_1.FieldPath.documentId())
                .startAt(firestore.doc('coll/doc/coll_suffix/doc'));
        }).to.throw('"coll/doc/coll_suffix/doc" is not part of the query result set and cannot be used as a query boundary.');
        chai_1.expect(() => {
            query.orderBy(src_1.FieldPath.documentId()).startAt(firestore.doc('coll/doc'));
        }).to.throw('"coll/doc" is not part of the query result set and cannot be used as a query boundary.');
        chai_1.expect(() => {
            query
                .orderBy(src_1.FieldPath.documentId())
                .startAt(firestore.doc('coll/doc/coll/doc/coll/doc'));
        }).to.throw('Only a direct child can be used as a query boundary. Found: "coll/doc/coll/doc/coll/doc".');
        // Validate that we can't pass a reference to a collection.
        chai_1.expect(() => {
            query.orderBy(src_1.FieldPath.documentId()).startAt('doc/coll');
        }).to.throw('When querying a collection and ordering by FieldPath.documentId(), ' +
            'the corresponding value must be a plain document ID, but ' +
            "'doc/coll' contains a slash.");
    });
    it('requires at least one value', () => {
        const query = firestore.collection('coll/doc/coll');
        chai_1.expect(() => {
            query.startAt();
        }).to.throw('Function "Query.startAt()" requires at least 1 argument.');
    });
    it('can specify document snapshot', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('__name__', 'ASCENDING'), startAt(true, {
                    referenceValue: `projects/${PROJECT_ID}/databases/(default)/` +
                        'documents/collectionId/doc',
                }));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return snapshot('collectionId/doc', {}).then(doc => {
                const query = firestore.collection('collectionId').startAt(doc);
                return query.get();
            });
        });
    });
    it("doesn't append documentId() twice", () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('__name__', 'ASCENDING'), startAt(true, {
                    referenceValue: `projects/${PROJECT_ID}/databases/(default)/` +
                        'documents/collectionId/doc',
                }));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return snapshot('collectionId/doc', {}).then(doc => {
                const query = firestore
                    .collection('collectionId')
                    .orderBy(src_1.FieldPath.documentId())
                    .startAt(doc);
                return query.get();
            });
        });
    });
    it('can extract implicit direction for document snapshot', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('foo', 'ASCENDING', '__name__', 'ASCENDING'), startAt(true, 'bar', {
                    referenceValue: `projects/${PROJECT_ID}/databases/(default)/` +
                        'documents/collectionId/doc',
                }));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return snapshot('collectionId/doc', { foo: 'bar' }).then(doc => {
                let query = firestore.collection('collectionId').orderBy('foo');
                query = query.startAt(doc);
                return query.get();
            });
        });
    });
    it('can extract explicit direction for document snapshot', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('foo', 'DESCENDING', '__name__', 'DESCENDING'), startAt(true, 'bar', {
                    referenceValue: `projects/${PROJECT_ID}/databases/(default)/` +
                        'documents/collectionId/doc',
                }));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return snapshot('collectionId/doc', { foo: 'bar' }).then(doc => {
                let query = firestore
                    .collection('collectionId')
                    .orderBy('foo', 'desc');
                query = query.startAt(doc);
                return query.get();
            });
        });
    });
    it('can specify document snapshot with inequality filter', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('c', 'ASCENDING', '__name__', 'ASCENDING'), startAt(true, 'c', {
                    referenceValue: `projects/${PROJECT_ID}/databases/(default)/` +
                        'documents/collectionId/doc',
                }), fieldFilters('a', 'EQUAL', 'a', 'b', 'ARRAY_CONTAINS', 'b', 'c', 'GREATER_THAN_OR_EQUAL', 'c', 'd', 'EQUAL', 'd'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return snapshot('collectionId/doc', { c: 'c' }).then(doc => {
                const query = firestore
                    .collection('collectionId')
                    .where('a', '==', 'a')
                    .where('b', 'array-contains', 'b')
                    .where('c', '>=', 'c')
                    .where('d', '==', 'd')
                    .startAt(doc);
                return query.get();
            });
        });
    });
    it('ignores equality filter with document snapshot cursor', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('__name__', 'ASCENDING'), startAt(true, {
                    referenceValue: `projects/${PROJECT_ID}/databases/(default)/` +
                        'documents/collectionId/doc',
                }), fieldFilters('foo', 'EQUAL', 'bar'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return snapshot('collectionId/doc', { foo: 'bar' }).then(doc => {
                const query = firestore
                    .collection('collectionId')
                    .where('foo', '==', 'bar')
                    .startAt(doc);
                return query.get();
            });
        });
    });
    it('validates field exists in document snapshot', () => {
        const query = firestore.collection('collectionId').orderBy('foo', 'desc');
        return snapshot('collectionId/doc', {}).then(doc => {
            chai_1.expect(() => query.startAt(doc)).to.throw('Field "foo" is missing in the provided DocumentSnapshot. Please provide a document that contains values for all specified orderBy() and where() constraints.');
        });
    });
    it('does not accept field deletes', () => {
        const query = firestore.collection('collectionId').orderBy('foo');
        chai_1.expect(() => {
            query.orderBy('foo').startAt('foo', src_1.FieldValue.delete());
        }).to.throw('Element at index 1 is not a valid query constraint. FieldValue.delete() must appear at the top-level and can only be used in update() or set() with {merge:true}.');
    });
    it('requires order by', () => {
        let query = firestore.collection('collectionId');
        query = query.orderBy('foo');
        chai_1.expect(() => query.startAt('foo', 'bar')).to.throw('Too many cursor values specified. The specified values must match the orderBy() constraints of the query.');
    });
    it('can overspecify order by', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('foo', 'ASCENDING', 'bar', 'ASCENDING'), startAt(true, 'foo'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query
                .orderBy('foo')
                .orderBy('bar')
                .startAt('foo');
            return query.get();
        });
    });
    it('validates input', () => {
        const query = firestore.collection('collectionId');
        chai_1.expect(() => query.startAt(123)).to.throw('Too many cursor values specified. The specified values must match the orderBy() constraints of the query.');
    });
    it('uses latest value', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('foo', 'ASCENDING'), startAt(true, 'bar'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query
                .orderBy('foo')
                .startAt('foo')
                .startAt('bar');
            return query.get();
        });
    });
});
describe('startAfter() interface', () => {
    let firestore;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreInstance => {
            firestore = firestoreInstance;
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('accepts fields', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('foo', 'ASCENDING', 'bar', 'ASCENDING'), startAt(false, 'foo', 'bar'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query
                .orderBy('foo')
                .orderBy('bar')
                .startAfter('foo', 'bar');
            return query.get();
        });
    });
    it('validates input', () => {
        const query = firestore.collection('collectionId');
        chai_1.expect(() => query.startAfter(123)).to.throw('Too many cursor values specified. The specified values must match the orderBy() constraints of the query.');
    });
    it('uses latest value', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('foo', 'ASCENDING'), startAt(false, 'bar'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query
                .orderBy('foo')
                .startAfter('foo')
                .startAfter('bar');
            return query.get();
        });
    });
});
describe('endAt() interface', () => {
    let firestore;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreInstance => {
            firestore = firestoreInstance;
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('accepts fields', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('foo', 'ASCENDING', 'bar', 'ASCENDING'), endAt(false, 'foo', 'bar'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query
                .orderBy('foo')
                .orderBy('bar')
                .endAt('foo', 'bar');
            return query.get();
        });
    });
    it('validates input', () => {
        const query = firestore.collection('collectionId');
        chai_1.expect(() => query.endAt(123)).to.throw('Too many cursor values specified. The specified values must match the orderBy() constraints of the query.');
    });
    it('uses latest value', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('foo', 'ASCENDING'), endAt(false, 'bar'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query
                .orderBy('foo')
                .endAt('foo')
                .endAt('bar');
            return query.get();
        });
    });
});
describe('endBefore() interface', () => {
    let firestore;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreInstance => {
            firestore = firestoreInstance;
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('accepts fields', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('foo', 'ASCENDING', 'bar', 'ASCENDING'), endAt(true, 'foo', 'bar'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query
                .orderBy('foo')
                .orderBy('bar')
                .endBefore('foo', 'bar');
            return query.get();
        });
    });
    it('validates input', () => {
        const query = firestore.collection('collectionId');
        chai_1.expect(() => query.endBefore(123)).to.throw('Too many cursor values specified. The specified values must match the orderBy() constraints of the query.');
    });
    it('uses latest value', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, orderBy('foo', 'ASCENDING'), endAt(true, 'bar'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            let query = firestore.collection('collectionId');
            query = query
                .orderBy('foo')
                .endBefore('foo')
                .endBefore('bar');
            return query.get();
        });
    });
    it('is immutable', () => {
        let expectedComponents = [limit(10)];
        const overrides = {
            runQuery: request => {
                queryEquals(request, ...expectedComponents);
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            const query = firestore.collection('collectionId').limit(10);
            const adjustedQuery = query.orderBy('foo').endBefore('foo');
            return query.get().then(() => {
                expectedComponents = [
                    limit(10),
                    orderBy('foo', 'ASCENDING'),
                    endAt(true, 'foo'),
                ];
                return adjustedQuery.get();
            });
        });
    });
});
describe('collectionGroup queries', () => {
    it('serialize correctly', () => {
        const overrides = {
            runQuery: request => {
                queryEquals(request, allDescendants(), fieldFilters('foo', 'EQUAL', 'bar'));
                return helpers_1.stream();
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            const query = firestore
                .collectionGroup('collectionId')
                .where('foo', '==', 'bar');
            return query.get();
        });
    });
    it('rejects slashes', () => {
        return helpers_1.createInstance().then(firestore => {
            chai_1.expect(() => firestore.collectionGroup('foo/bar')).to.throw("Invalid collectionId 'foo/bar'. Collection IDs must not contain '/'.");
        });
    });
    it('rejects slashes', () => {
        return helpers_1.createInstance().then(firestore => {
            const query = firestore.collectionGroup('collectionId');
            chai_1.expect(() => {
                query.orderBy(src_1.FieldPath.documentId()).startAt('coll');
            }).to.throw('When querying a collection group and ordering by ' +
                'FieldPath.documentId(), the corresponding value must result in a ' +
                "valid document path, but 'coll' is not because it contains an odd " +
                'number of segments.');
        });
    });
});
//# sourceMappingURL=query.js.map