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
const google_gax_1 = require("google-gax");
const through2 = require("through2");
const src_1 = require("../src");
const helpers_1 = require("./util/helpers");
const PROJECT_ID = 'test-project';
const INVALID_ARGUMENTS_TO_UPDATE = new RegExp('Update\\(\\) requires either ' +
    'a single JavaScript object or an alternating list of field/value pairs ' +
    'that can be followed by an optional precondition.');
// Change the argument to 'console.log' to enable debug output.
src_1.setLogFunction(() => { });
describe('DocumentReference interface', () => {
    let firestore;
    let documentRef;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreInstance => {
            firestore = firestoreInstance;
            documentRef = firestore.doc('collectionId/documentId');
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('has collection() method', () => {
        chai_1.expect(() => documentRef.collection(42)).to.throw('Value for argument "collectionPath" is not a valid resource path. Path must be a non-empty string.');
        let collection = documentRef.collection('col');
        chai_1.expect(collection.id).to.equal('col');
        chai_1.expect(() => documentRef.collection('col/doc')).to.throw('Value for argument "collectionPath" must point to a collection, but was "col/doc". Your path does not contain an odd number of components.');
        collection = documentRef.collection('col/doc/col');
        chai_1.expect(collection.id).to.equal('col');
    });
    it('has path property', () => {
        chai_1.expect(documentRef.path).to.equal('collectionId/documentId');
    });
    it('has parent property', () => {
        chai_1.expect(documentRef.parent.path).to.equal('collectionId');
    });
    it('has isEqual() method', () => {
        const doc1 = firestore.doc('coll/doc1');
        const doc1Equals = firestore.doc('coll/doc1');
        const doc2 = firestore.doc('coll/doc1/coll/doc1');
        chai_1.expect(doc1.isEqual(doc1Equals)).to.be.true;
        chai_1.expect(doc1.isEqual(doc2)).to.be.false;
    });
});
describe('serialize document', () => {
    let firestore;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreInstance => {
            firestore = firestoreInstance;
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('serializes to Protobuf JS', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    document: helpers_1.document('documentId', 'bytes', {
                        bytesValue: Buffer.from('AG=', 'base64'),
                    }),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').set({
                bytes: Buffer.from('AG=', 'base64'),
            });
        });
    });
    it("doesn't serialize unsupported types", () => {
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').set({ foo: undefined });
        }).to.throw('Value for argument "data" is not a valid Firestore document. Cannot use "undefined" as a Firestore value (found in field "foo").');
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').set({
                foo: src_1.FieldPath.documentId(),
            });
        }).to.throw('Value for argument "data" is not a valid Firestore document. Cannot use object of type "FieldPath" as a Firestore value (found in field "foo").');
        chai_1.expect(() => {
            class Foo {
            }
            firestore.doc('collectionId/documentId').set({ foo: new Foo() });
        }).to.throw('Value for argument "data" is not a valid Firestore document. Couldn\'t serialize object of type "Foo" (found in field "foo"). Firestore doesn\'t support JavaScript objects with custom prototypes (i.e. objects that were created via the "new" operator).');
        chai_1.expect(() => {
            class Foo {
            }
            firestore
                .doc('collectionId/documentId')
                .set(new Foo());
        }).to.throw('Value for argument "data" is not a valid Firestore document. Couldn\'t serialize object of type "Foo". Firestore doesn\'t support JavaScript objects with custom prototypes (i.e. objects that were created via the "new" operator).');
        chai_1.expect(() => {
            class Foo {
            }
            class Bar extends Foo {
            }
            firestore
                .doc('collectionId/documentId')
                .set(new Bar());
        }).to.throw('Value for argument "data" is not a valid Firestore document. Couldn\'t serialize object of type "Bar". Firestore doesn\'t support JavaScript objects with custom prototypes (i.e. objects that were created via the "new" operator).');
    });
    it('provides custom error for objects from different Firestore instance', () => {
        class FieldPath {
        }
        class GeoPoint {
        }
        class Timestamp {
        }
        const customClasses = [new FieldPath(), new GeoPoint(), new Timestamp()];
        for (const customClass of customClasses) {
            chai_1.expect(() => {
                firestore
                    .doc('collectionId/documentId')
                    .set(customClass);
            }).to.throw('Value for argument "data" is not a valid Firestore document. ' +
                `Detected an object of type "${customClass.constructor.name}" that doesn't match the expected instance.`);
        }
    });
    it('serializes large numbers into doubles', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    document: helpers_1.document('documentId', 'largeNumber', {
                        doubleValue: 18014398509481984,
                    }),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').set({
                // Set to 2^54, which should be stored as a double.
                largeNumber: 18014398509481984,
            });
        });
    });
    it('serializes date before 1970', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    document: helpers_1.document('documentId', 'moonLanding', {
                        timestampValue: {
                            nanos: 123000000,
                            seconds: -14182920,
                        },
                    }),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').set({
                moonLanding: new Date('Jul 20 1969 20:18:00.123 UTC'),
            });
        });
    });
    it('supports Moment.js', () => {
        class Moment {
            toDate() {
                return new Date('Jul 20 1969 20:18:00.123 UTC');
            }
        }
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    document: helpers_1.document('documentId', 'moonLanding', {
                        timestampValue: {
                            nanos: 123000000,
                            seconds: -14182920,
                        },
                    }),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').set({
                moonLanding: new Moment(),
            });
        });
    });
    it('serializes unicode keys', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    document: helpers_1.document('documentId', '😀', '😜'),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').set({
                '😀': '😜',
            });
        });
    });
    it('accepts both blob formats', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    document: helpers_1.document('documentId', 'blob1', { bytesValue: new Uint8Array([0, 1, 2]) }, 'blob2', {
                        bytesValue: Buffer.from([0, 1, 2]),
                    }),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').set({
                blob1: new Uint8Array([0, 1, 2]),
                blob2: Buffer.from([0, 1, 2]),
            });
        });
    });
    it('supports NaN and Infinity', () => {
        const overrides = {
            commit: request => {
                const fields = request.writes[0].update.fields;
                chai_1.expect(fields.nanValue.doubleValue).to.be.a('number');
                chai_1.expect(fields.nanValue.doubleValue).to.be.NaN;
                chai_1.expect(fields.posInfinity.doubleValue).to.equal(Infinity);
                chai_1.expect(fields.negInfinity.doubleValue).to.equal(-Infinity);
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').set({
                nanValue: NaN,
                posInfinity: Infinity,
                negInfinity: -Infinity,
            });
        });
    });
    it('with invalid geopoint', () => {
        chai_1.expect(() => {
            new src_1.GeoPoint(57.2999988, 'INVALID');
        }).to.throw('Value for argument "longitude" is not a valid number');
        chai_1.expect(() => {
            new src_1.GeoPoint('INVALID', -4.4499982);
        }).to.throw('Value for argument "latitude" is not a valid number');
        chai_1.expect(() => {
            new src_1.GeoPoint();
        }).to.throw('Value for argument "latitude" is not a valid number');
        chai_1.expect(() => {
            new src_1.GeoPoint(NaN, 0);
        }).to.throw('Value for argument "latitude" is not a valid number');
        chai_1.expect(() => {
            new src_1.GeoPoint(Infinity, 0);
        }).to.throw('Value for argument "latitude" must be within [-90, 90] inclusive, but was: Infinity');
        chai_1.expect(() => {
            new src_1.GeoPoint(91, 0);
        }).to.throw('Value for argument "latitude" must be within [-90, 90] inclusive, but was: 91');
        chai_1.expect(() => {
            new src_1.GeoPoint(90, 181);
        }).to.throw('Value for argument "longitude" must be within [-180, 180] inclusive, but was: 181');
    });
    it('resolves infinite nesting', () => {
        const obj = {};
        obj.foo = obj;
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').update(obj);
        }).to.throw('Value for argument "dataOrField" is not a valid Firestore value. Input object is deeper than 20 levels or contains a cycle.');
    });
    it('is able to write a document reference with cycles', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    document: helpers_1.document('documentId', 'ref', {
                        referenceValue: `projects/${PROJECT_ID}/databases/(default)/documents/collectionId/documentId`,
                    }),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            // The Firestore Admin SDK adds a cyclic reference to the 'Firestore'
            // member of 'DocumentReference'. We emulate this behavior in this
            // test to verify that we can properly serialize DocumentReference
            // instances, even if they have cyclic references (we shouldn't try to
            // validate them beyond the instanceof check).
            const ref = firestore.doc('collectionId/documentId');
            // tslint:disable-next-line:no-any
            ref.firestore.firestore = firestore;
            return ref.set({ ref });
        });
    });
});
describe('deserialize document', () => {
    it('deserializes Protobuf JS', () => {
        const overrides = {
            batchGetDocuments: () => {
                return helpers_1.stream(helpers_1.found(helpers_1.document('documentId', 'foo', {
                    bytesValue: Buffer.from('AG=', 'base64'),
                })));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .get()
                .then(res => {
                chai_1.expect(res.data()).to.deep.eq({ foo: Buffer.from('AG=', 'base64') });
            });
        });
    });
    it('deserializes date before 1970', () => {
        const overrides = {
            batchGetDocuments: () => {
                return helpers_1.stream(helpers_1.found(helpers_1.document('documentId', 'moonLanding', {
                    timestampValue: {
                        nanos: 123000000,
                        seconds: -14182920,
                    },
                })));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .get()
                .then(res => {
                chai_1.expect(res.get('moonLanding').toMillis()).to.equal(new Date('Jul 20 1969 20:18:00.123 UTC').getTime());
            });
        });
    });
    it('returns undefined for unknown fields', () => {
        const overrides = {
            batchGetDocuments: () => {
                return helpers_1.stream(helpers_1.found(helpers_1.document('documentId')));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .get()
                .then(res => {
                chai_1.expect(res.get('bar')).to.not.exist;
                chai_1.expect(res.get('bar.foo')).to.not.exist;
            });
        });
    });
    it('supports NaN and Infinity', () => {
        const overrides = {
            batchGetDocuments: () => {
                return helpers_1.stream(helpers_1.found(helpers_1.document('documentId', 'nanValue', { doubleValue: NaN }, 'posInfinity', { doubleValue: Infinity }, 'negInfinity', { doubleValue: -Infinity })));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .get()
                .then(res => {
                chai_1.expect(res.get('nanValue')).to.be.a('number');
                chai_1.expect(res.get('nanValue')).to.be.NaN;
                chai_1.expect(res.get('posInfinity')).to.equal(Infinity);
                chai_1.expect(res.get('negInfinity')).to.equal(-Infinity);
            });
        });
    });
    it("doesn't deserialize unsupported types", () => {
        const overrides = {
            batchGetDocuments: () => {
                return helpers_1.stream(helpers_1.found(helpers_1.document('documentId', 'moonLanding', {
                    valueType: 'foo',
                })));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .get()
                .then(doc => {
                chai_1.expect(() => {
                    doc.data();
                }).to.throw('Cannot decode type from Firestore Value: {"valueType":"foo"}');
            });
        });
    });
    it("doesn't deserialize invalid latitude", () => {
        const overrides = {
            batchGetDocuments: () => {
                return helpers_1.stream(helpers_1.found(helpers_1.document('documentId', 'geoPointValue', {
                    geoPointValue: {
                        latitude: 'foo',
                        longitude: -122.947778,
                    },
                })));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .get()
                .then(doc => {
                chai_1.expect(() => doc.data()).to.throw('Value for argument "latitude" is not a valid number.');
            });
        });
    });
    it("doesn't deserialize invalid longitude", () => {
        const overrides = {
            batchGetDocuments: () => {
                return helpers_1.stream(helpers_1.found(helpers_1.document('documentId', 'geoPointValue', {
                    geoPointValue: {
                        latitude: 50.1430847,
                        longitude: 'foo',
                    },
                })));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .get()
                .then(doc => {
                chai_1.expect(() => doc.data()).to.throw('Value for argument "longitude" is not a valid number.');
            });
        });
    });
});
describe('get document', () => {
    it('returns document', () => {
        const overrides = {
            batchGetDocuments: request => {
                helpers_1.requestEquals(request, helpers_1.retrieve('documentId'));
                return helpers_1.stream(helpers_1.found(helpers_1.document('documentId', 'foo', {
                    mapValue: {
                        fields: {
                            bar: {
                                stringValue: 'foobar',
                            },
                        },
                    },
                })));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .get()
                .then(result => {
                chai_1.expect(result.data()).to.deep.eq({ foo: { bar: 'foobar' } });
                chai_1.expect(result.get('foo')).to.deep.eq({ bar: 'foobar' });
                chai_1.expect(result.get('foo.bar')).to.equal('foobar');
                chai_1.expect(result.get(new src_1.FieldPath('foo', 'bar'))).to.equal('foobar');
                chai_1.expect(result.ref.id).to.equal('documentId');
            });
        });
    });
    it('returns read, update and create times', () => {
        const overrides = {
            batchGetDocuments: () => {
                return helpers_1.stream(helpers_1.found(helpers_1.document('documentId')));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .get()
                .then(result => {
                chai_1.expect(result.createTime.isEqual(new src_1.Timestamp(1, 2))).to.be.true;
                chai_1.expect(result.updateTime.isEqual(new src_1.Timestamp(3, 4))).to.be.true;
                chai_1.expect(result.readTime.isEqual(new src_1.Timestamp(5, 6))).to.be.true;
            });
        });
    });
    it('returns not found', () => {
        const overrides = {
            batchGetDocuments: () => {
                return helpers_1.stream(helpers_1.missing('documentId'));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .get()
                .then(result => {
                chai_1.expect(result.exists).to.be.false;
                chai_1.expect(result.readTime.isEqual(new src_1.Timestamp(5, 6))).to.be.true;
                chai_1.expect(result.data()).to.not.exist;
                chai_1.expect(result.get('foo')).to.not.exist;
            });
        });
    });
    it('throws error', done => {
        const overrides = {
            batchGetDocuments: () => {
                const error = new google_gax_1.GoogleError('RPC Error');
                error.code = google_gax_1.Status.PERMISSION_DENIED;
                return helpers_1.stream(error);
            },
        };
        helpers_1.createInstance(overrides).then(firestore => {
            firestore
                .doc('collectionId/documentId')
                .get()
                .catch(err => {
                chai_1.expect(err.message).to.equal('RPC Error');
                done();
            });
        });
    });
    it('cannot obtain field value without field path', () => {
        const overrides = {
            batchGetDocuments: () => {
                return helpers_1.stream(helpers_1.found(helpers_1.document('documentId', 'foo', {
                    mapValue: {
                        fields: {
                            bar: {
                                stringValue: 'foobar',
                            },
                        },
                    },
                })));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .get()
                .then(doc => {
                chai_1.expect(() => doc.get()).to.throw('Value for argument "field" is not a valid field path. The path cannot be omitted.');
            });
        });
    });
});
describe('delete document', () => {
    let firestore;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreClient => {
            firestore = firestoreClient;
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('generates proto', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.remove('documentId'));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').delete();
        });
    });
    it('returns update time', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.remove('documentId'));
                return helpers_1.response({
                    commitTime: {
                        nanos: 123000000,
                        seconds: 479978400,
                    },
                    writeResults: [{}],
                });
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .delete()
                .then(res => {
                chai_1.expect(res.writeTime.isEqual(new src_1.Timestamp(479978400, 123000000))).to
                    .be.true;
            });
        });
    });
    it('with last update time precondition', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.remove('documentId', {
                    updateTime: {
                        nanos: 123000000,
                        seconds: 479978400,
                    },
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            const docRef = firestore.doc('collectionId/documentId');
            return Promise.all([
                docRef.delete({
                    lastUpdateTime: new src_1.Timestamp(479978400, 123000000),
                }),
                docRef.delete({
                    lastUpdateTime: src_1.Timestamp.fromMillis(479978400123),
                }),
                docRef.delete({
                    lastUpdateTime: src_1.Timestamp.fromDate(new Date(479978400123)),
                }),
            ]);
        });
    });
    it('with invalid last update time precondition', () => {
        chai_1.expect(() => {
            return firestore.doc('collectionId/documentId').delete({
                lastUpdateTime: 1337,
            });
        }).to.throw('"lastUpdateTime" is not a Firestore Timestamp.');
    });
    it('throws if "exists" is not a boolean', () => {
        chai_1.expect(() => {
            return firestore.doc('collectionId/documentId').delete({
                exists: 42,
            });
        }).to.throw('"exists" is not a boolean.');
    });
    it('throws if no delete conditions are provided', () => {
        chai_1.expect(() => {
            return firestore
                .doc('collectionId/documentId')
                .delete(42);
        }).to.throw('Input is not an object.');
    });
    it('throws if more than one condition is provided', () => {
        chai_1.expect(() => {
            return firestore.doc('collectionId/documentId').delete({
                exists: false,
                lastUpdateTime: src_1.Timestamp.now(),
            });
        }).to.throw('Input specifies more than one precondition.');
    });
});
describe('set document', () => {
    let firestore;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreClient => {
            firestore = firestoreClient;
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('supports empty map', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    document: helpers_1.document('documentId'),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').set({});
        });
    });
    it('supports nested empty map', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    document: helpers_1.document('documentId', 'a', {
                        mapValue: {},
                    }),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').set({ a: {} });
        });
    });
    it('skips merges with just field transform', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    transforms: [helpers_1.serverTimestamp('a'), helpers_1.serverTimestamp('b.c')],
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').set({
                a: src_1.FieldValue.serverTimestamp(),
                b: { c: src_1.FieldValue.serverTimestamp() },
            }, { merge: true });
        });
    });
    it('sends empty non-merge write even with just field transform', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    document: helpers_1.document('documentId'),
                    transforms: [helpers_1.serverTimestamp('a'), helpers_1.serverTimestamp('b.c')],
                }));
                return helpers_1.response(helpers_1.writeResult(2));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').set({
                a: src_1.FieldValue.serverTimestamp(),
                b: { c: src_1.FieldValue.serverTimestamp() },
            });
        });
    });
    it('supports document merges', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    document: helpers_1.document('documentId', 'a', 'b', 'c', {
                        mapValue: {
                            fields: {
                                d: {
                                    stringValue: 'e',
                                },
                            },
                        },
                    }),
                    mask: helpers_1.updateMask('a', 'c.d', 'f'),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .set({ a: 'b', c: { d: 'e' }, f: src_1.FieldValue.delete() }, { merge: true });
        });
    });
    it('supports document merges with field mask', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    document: helpers_1.document('documentId', 'a', 'foo', 'b', {
                        mapValue: {
                            fields: {
                                c: {
                                    stringValue: 'foo',
                                },
                            },
                        },
                    }, 'd', {
                        mapValue: {
                            fields: {
                                e: {
                                    stringValue: 'foo',
                                },
                            },
                        },
                    }),
                    mask: helpers_1.updateMask('a', 'b', 'd.e', 'f'),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').set({
                a: 'foo',
                b: { c: 'foo' },
                d: { e: 'foo', ignore: 'foo' },
                f: src_1.FieldValue.delete(),
                ignore: 'foo',
                ignoreMap: { a: 'foo' },
            }, { mergeFields: ['a', new src_1.FieldPath('b'), 'd.e', 'f'] });
        });
    });
    it('supports document merges with empty field mask', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    document: helpers_1.document('documentId'),
                    mask: helpers_1.updateMask(),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').set({}, {
                mergeFields: [],
            });
        });
    });
    it('supports document merges with field mask and empty maps', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    document: helpers_1.document('documentId', 'a', {
                        mapValue: {
                            fields: {
                                b: {
                                    mapValue: {},
                                },
                            },
                        },
                    }, 'c', {
                        mapValue: {
                            fields: {
                                d: {
                                    mapValue: {},
                                },
                            },
                        },
                    }),
                    mask: helpers_1.updateMask('a', 'c.d'),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').set({
                a: { b: {} },
                c: { d: {} },
            }, { mergeFields: ['a', new src_1.FieldPath('c', 'd')] });
        });
    });
    it('supports document merges with field mask and field transform', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    document: helpers_1.document('documentId'),
                    mask: helpers_1.updateMask('b', 'f'),
                    transforms: [
                        helpers_1.serverTimestamp('a'),
                        helpers_1.serverTimestamp('b.c'),
                        helpers_1.serverTimestamp('d.e'),
                    ],
                }));
                return helpers_1.response(helpers_1.writeResult(2));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').set({
                a: src_1.FieldValue.serverTimestamp(),
                b: { c: src_1.FieldValue.serverTimestamp() },
                d: {
                    e: src_1.FieldValue.serverTimestamp(),
                    ignore: src_1.FieldValue.serverTimestamp(),
                },
                f: src_1.FieldValue.delete(),
                ignore: src_1.FieldValue.serverTimestamp(),
                ignoreMap: { a: src_1.FieldValue.serverTimestamp() },
            }, { mergeFields: ['a', new src_1.FieldPath('b'), 'd.e', 'f'] });
        });
    });
    it('supports empty merge', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    document: helpers_1.document('documentId'),
                    mask: helpers_1.updateMask(),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').set({}, { merge: true });
        });
    });
    it('supports nested empty merge', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    document: helpers_1.document('documentId', 'a', {
                        mapValue: {},
                    }),
                    mask: helpers_1.updateMask('a'),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').set({ a: {} }, {
                merge: true,
            });
        });
    });
    it("doesn't split on dots", () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.set({
                    document: helpers_1.document('documentId', 'a.b', 'c'),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').set({ 'a.b': 'c' });
        });
    });
    it('validates merge option', () => {
        chai_1.expect(() => {
            firestore
                .doc('collectionId/documentId')
                .set({ foo: 'bar' }, 'foo');
        }).to.throw('Value for argument "options" is not a valid set() options argument. Input is not an object.');
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').set({ foo: 'bar' }, {
                merge: 42,
            });
        }).to.throw('Value for argument "options" is not a valid set() options argument. "merge" is not a boolean.');
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').set({ foo: 'bar' }, {
                mergeFields: 42,
            });
        }).to.throw('Value for argument "options" is not a valid set() options argument. "mergeFields" is not an array.');
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').set({ foo: 'bar' }, {
                mergeFields: [null],
            });
        }).to.throw('Value for argument "options" is not a valid set() options argument. "mergeFields" is not valid: Element at index 0 is not a valid field path. Paths can only be specified as strings or via a FieldPath object.');
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').set({ foo: 'bar' }, {
                mergeFields: ['foobar'],
            });
        }).to.throw('Input data is missing for field "foobar".');
        chai_1.expect(() => {
            firestore
                .doc('collectionId/documentId')
                .set({ foo: 'bar' }, { merge: true, mergeFields: [] });
        }).to.throw('Value for argument "options" is not a valid set() options argument. You cannot specify both "merge" and "mergeFields".');
    });
    it('requires an object', () => {
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').set(null);
        }).to.throw('Value for argument "data" is not a valid Firestore document. Input is not a plain JavaScript object.');
    });
    it("doesn't support non-merge deletes", () => {
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').set({ foo: src_1.FieldValue.delete() });
        }).to.throw('Value for argument "data" is not a valid Firestore document. FieldValue.delete() must appear at the top-level and can only be used in update() or set() with {merge:true} (found in field "foo").');
    });
    it("doesn't accept arrays", () => {
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').set([42]);
        }).to.throw('Value for argument "data" is not a valid Firestore document. Input is not a plain JavaScript object.');
    });
});
describe('create document', () => {
    let firestore;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreClient => {
            firestore = firestoreClient;
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('creates document', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.create({ document: helpers_1.document('documentId') }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').create({});
        });
    });
    it('returns update time', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.create({ document: helpers_1.document('documentId') }));
                return helpers_1.response({
                    commitTime: {
                        nanos: 0,
                        seconds: 0,
                    },
                    writeResults: [
                        {
                            updateTime: {
                                nanos: 123000000,
                                seconds: 479978400,
                            },
                        },
                    ],
                });
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .create({})
                .then(res => {
                chai_1.expect(res.writeTime.isEqual(new src_1.Timestamp(479978400, 123000000))).to
                    .be.true;
            });
        });
    });
    it('supports field transform', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.create({
                    transforms: [
                        helpers_1.serverTimestamp('field'),
                        helpers_1.serverTimestamp('map.field'),
                    ],
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').create({
                field: src_1.FieldValue.serverTimestamp(),
                map: { field: src_1.FieldValue.serverTimestamp() },
            });
        });
    });
    it('supports nested empty map', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.create({
                    document: helpers_1.document('documentId', 'a', {
                        mapValue: {
                            fields: {
                                b: {
                                    mapValue: {},
                                },
                            },
                        },
                    }),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').create({ a: { b: {} } });
        });
    });
    it('requires an object', () => {
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').create(null);
        }).to.throw('Value for argument "data" is not a valid Firestore document. Input is not a plain JavaScript object.');
    });
    it("doesn't accept arrays", () => {
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').create([42]);
        }).to.throw('Value for argument "data" is not a valid Firestore document. Input is not a plain JavaScript object.');
    });
});
describe('update document', () => {
    let firestore;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreClient => {
            firestore = firestoreClient;
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('generates proto', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.update({
                    document: helpers_1.document('documentId', 'foo', 'bar'),
                    mask: helpers_1.updateMask('foo'),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').update({ foo: 'bar' });
        });
    });
    it('supports nested field transform', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.update({
                    document: helpers_1.document('documentId', 'foo', {
                        mapValue: {},
                    }),
                    transforms: [helpers_1.serverTimestamp('a.b'), helpers_1.serverTimestamp('c.d')],
                    mask: helpers_1.updateMask('a', 'foo'),
                }));
                return helpers_1.response(helpers_1.writeResult(2));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').update({
                foo: {},
                a: { b: src_1.FieldValue.serverTimestamp() },
                'c.d': src_1.FieldValue.serverTimestamp(),
            });
        });
    });
    it('skips write for single field transform', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.update({ transforms: [helpers_1.serverTimestamp('a')] }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .update('a', src_1.FieldValue.serverTimestamp());
        });
    });
    it('supports nested empty map', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.update({
                    document: helpers_1.document('documentId', 'a', {
                        mapValue: {},
                    }),
                    mask: helpers_1.updateMask('a'),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').update({ a: {} });
        });
    });
    it('supports nested delete', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.update({ document: helpers_1.document('documentId'), mask: helpers_1.updateMask('a.b') }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').update({
                'a.b': src_1.FieldValue.delete(),
            });
        });
    });
    it('returns update time', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.update({
                    document: helpers_1.document('documentId', 'foo', 'bar'),
                    mask: helpers_1.updateMask('foo'),
                }));
                return helpers_1.response({
                    commitTime: {
                        nanos: 0,
                        seconds: 0,
                    },
                    writeResults: [
                        {
                            updateTime: {
                                nanos: 123000000,
                                seconds: 479978400,
                            },
                        },
                    ],
                });
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .update({ foo: 'bar' })
                .then(res => {
                chai_1.expect(res.writeTime.isEqual(new src_1.Timestamp(479978400, 123000000))).to
                    .be.true;
            });
        });
    });
    it('with last update time precondition', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.update({
                    document: helpers_1.document('documentId', 'foo', 'bar'),
                    mask: helpers_1.updateMask('foo'),
                    precondition: {
                        updateTime: {
                            nanos: 123000000,
                            seconds: 479978400,
                        },
                    },
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return Promise.all([
                firestore.doc('collectionId/documentId').update({ foo: 'bar' }, {
                    lastUpdateTime: new src_1.Timestamp(479978400, 123000000),
                }),
                firestore.doc('collectionId/documentId').update('foo', 'bar', {
                    lastUpdateTime: new src_1.Timestamp(479978400, 123000000),
                }),
            ]);
        });
    });
    it('with invalid last update time precondition', () => {
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').update({ foo: 'bar' }, {
                lastUpdateTime: 'foo',
            });
        }).to.throw('"lastUpdateTime" is not a Firestore Timestamp.');
    });
    it('requires at least one field', () => {
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').update({});
        }).to.throw('At least one field must be updated.');
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').update();
        }).to.throw('Function "DocumentReference.update()" requires at least 1 argument.');
    });
    it('rejects nested deletes', () => {
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').update({
                a: { b: src_1.FieldValue.delete() },
            });
        }).to.throw('Update() requires either a single JavaScript object or an alternating list of field/value pairs that can be followed by an optional precondition. Value for argument "dataOrField" is not a valid Firestore value. FieldValue.delete() must appear at the top-level and can only be used in update() or set() with {merge:true} (found in field "a.b").');
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').update('a', {
                b: src_1.FieldValue.delete(),
            });
        }).to.throw('Update() requires either a single JavaScript object or an alternating list of field/value pairs that can be followed by an optional precondition. Element at index 1 is not a valid Firestore value. FieldValue.delete() must appear at the top-level and can only be used in update() or set() with {merge:true} (found in field "a.b").');
        chai_1.expect(() => {
            firestore
                .doc('collectionId/documentId')
                .update('a', src_1.FieldValue.arrayUnion(src_1.FieldValue.delete()));
        }).to.throw('Element at index 0 is not a valid array element. FieldValue.delete() cannot be used inside of an array.');
    });
    it('with top-level document', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.update({
                    document: helpers_1.document('documentId', 'foo', 'bar'),
                    mask: helpers_1.updateMask('foo'),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').update({
                foo: 'bar',
            });
        });
    });
    it('with nested document', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.update({
                    document: helpers_1.document('documentId', 'a', {
                        mapValue: {
                            fields: {
                                b: {
                                    mapValue: {
                                        fields: {
                                            c: {
                                                stringValue: 'foobar',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    }, 'foo', {
                        mapValue: {
                            fields: {
                                bar: {
                                    stringValue: 'foobar',
                                },
                            },
                        },
                    }),
                    mask: helpers_1.updateMask('a.b.c', 'foo.bar'),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return Promise.all([
                firestore.doc('collectionId/documentId').update({
                    'foo.bar': 'foobar',
                    'a.b.c': 'foobar',
                }),
                firestore
                    .doc('collectionId/documentId')
                    .update('foo.bar', 'foobar', new src_1.FieldPath('a', 'b', 'c'), 'foobar'),
            ]);
        });
    });
    it('with two nested fields ', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.update({
                    document: helpers_1.document('documentId', 'foo', {
                        mapValue: {
                            fields: {
                                bar: { stringValue: 'two' },
                                deep: {
                                    mapValue: {
                                        fields: {
                                            bar: { stringValue: 'two' },
                                            foo: { stringValue: 'one' },
                                        },
                                    },
                                },
                                foo: { stringValue: 'one' },
                            },
                        },
                    }),
                    mask: helpers_1.updateMask('foo.bar', 'foo.deep.bar', 'foo.deep.foo', 'foo.foo'),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return Promise.all([
                firestore.doc('collectionId/documentId').update({
                    'foo.foo': 'one',
                    'foo.bar': 'two',
                    'foo.deep.foo': 'one',
                    'foo.deep.bar': 'two',
                }),
                firestore
                    .doc('collectionId/documentId')
                    .update('foo.foo', 'one', 'foo.bar', 'two', 'foo.deep.foo', 'one', 'foo.deep.bar', 'two'),
            ]);
        });
    });
    it('with nested field and document transform ', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.update({
                    document: helpers_1.document('documentId', 'a', {
                        mapValue: {
                            fields: {
                                b: {
                                    mapValue: {
                                        fields: {
                                            keep: {
                                                stringValue: 'keep',
                                            },
                                        },
                                    },
                                },
                                c: {
                                    mapValue: {
                                        fields: {
                                            keep: {
                                                stringValue: 'keep',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    }),
                    mask: helpers_1.updateMask('a.b.delete', 'a.b.keep', 'a.c.delete', 'a.c.keep'),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').update({
                'a.b.delete': src_1.FieldValue.delete(),
                'a.b.keep': 'keep',
                'a.c.delete': src_1.FieldValue.delete(),
                'a.c.keep': 'keep',
            });
        });
    });
    it('with field with dot ', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.update({
                    document: helpers_1.document('documentId', 'a.b', 'c'),
                    mask: helpers_1.updateMask('`a.b`'),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .update(new src_1.FieldPath('a.b'), 'c');
        });
    });
    it('with conflicting update', () => {
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').update({
                foo: 'foobar',
                'foo.bar': 'foobar',
            });
        }).to.throw('Value for argument "dataOrField" is not a valid update map. Field "foo" was specified multiple times.');
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').update({
                foo: 'foobar',
                'foo.bar.foobar': 'foobar',
            });
        }).to.throw('Value for argument "dataOrField" is not a valid update map. Field "foo" was specified multiple times.');
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').update({
                'foo.bar': 'foobar',
                foo: 'foobar',
            });
        }).to.throw('Value for argument "dataOrField" is not a valid update map. Field "foo" was specified multiple times.');
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').update({
                'foo.bar': 'foobar',
                'foo.bar.foo': 'foobar',
            });
        }).to.throw('Value for argument "dataOrField" is not a valid update map. Field "foo.bar" was specified multiple times.');
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').update({
                'foo.bar': { foo: 'foobar' },
                'foo.bar.foo': 'foobar',
            });
        }).to.throw('Value for argument "dataOrField" is not a valid update map. Field "foo.bar" was specified multiple times.');
        chai_1.expect(() => {
            firestore
                .doc('collectionId/documentId')
                .update('foo.bar', 'foobar', 'foo', 'foobar');
        }).to.throw('Value for argument "dataOrField" is not a valid update map. Field "foo" was specified multiple times.');
        chai_1.expect(() => {
            firestore
                .doc('collectionId/documentId')
                .update('foo', { foobar: 'foobar' }, 'foo.bar', { foobar: 'foobar' });
        }).to.throw('Value for argument "dataOrField" is not a valid update map. Field "foo" was specified multiple times.');
        chai_1.expect(() => {
            firestore
                .doc('collectionId/documentId')
                .update('foo', { foobar: 'foobar' }, 'foo.bar', { foobar: 'foobar' });
        }).to.throw('Value for argument "dataOrField" is not a valid update map. Field "foo" was specified multiple times.');
    });
    it('with valid field paths', () => {
        const validFields = ['foo.bar', '_', 'foo.bar.foobar', '\n`'];
        for (let i = 0; i < validFields.length; ++i) {
            firestore.collection('col').select(validFields[i]);
        }
    });
    it('with empty field path', () => {
        chai_1.expect(() => {
            const doc = { '': 'foo' };
            firestore.doc('col/doc').update(doc);
        }).to.throw('Update() requires either a single JavaScript object or an alternating list of field/value pairs that can be followed by an optional precondition. Element at index 0 should not be an empty string.');
    });
    it('with invalid field paths', () => {
        const invalidFields = [
            '.a',
            'a.',
            '.a.',
            'a..a',
            'a*a',
            'a/a',
            'a[a',
            'a]a',
        ];
        for (let i = 0; i < invalidFields.length; ++i) {
            chai_1.expect(() => {
                const doc = {};
                doc[invalidFields[i]] = 'foo';
                firestore.doc('col/doc').update(doc);
            }).to.throw(/Value for argument ".*" is not a valid field path/);
        }
    });
    it("doesn't accept argument after precondition", () => {
        chai_1.expect(() => {
            firestore.doc('collectionId/documentId').update('foo', 'bar', {
                exists: true,
            });
        }).to.throw(INVALID_ARGUMENTS_TO_UPDATE);
        chai_1.expect(() => {
            firestore
                .doc('collectionId/documentId')
                .update({ foo: 'bar' }, { exists: true }, 'foo');
        }).to.throw(INVALID_ARGUMENTS_TO_UPDATE);
    });
    it('accepts an object', () => {
        chai_1.expect(() => firestore.doc('collectionId/documentId').update(null)).to.throw('Value for argument "dataOrField" is not a valid Firestore document. Input is not a plain JavaScript object.');
    });
    it("doesn't accept arrays", () => {
        chai_1.expect(() => firestore.doc('collectionId/documentId').update([42])).to.throw('Value for argument "dataOrField" is not a valid Firestore document. Input is not a plain JavaScript object.');
    });
    it('with field delete', () => {
        const overrides = {
            commit: request => {
                helpers_1.requestEquals(request, helpers_1.update({
                    document: helpers_1.document('documentId', 'bar', 'foobar'),
                    mask: helpers_1.updateMask('bar', 'foo'),
                }));
                return helpers_1.response(helpers_1.writeResult(1));
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore.doc('collectionId/documentId').update({
                foo: src_1.FieldValue.delete(),
                bar: 'foobar',
            });
        });
    });
});
describe('listCollections() method', () => {
    it('sorts results', () => {
        const overrides = {
            listCollectionIds: request => {
                chai_1.expect(request).to.deep.eq({
                    parent: `projects/${PROJECT_ID}/databases/(default)/documents/coll/doc`,
                    pageSize: 65535,
                });
                return helpers_1.response(['second', 'first']);
            },
        };
        return helpers_1.createInstance(overrides).then(firestore => {
            return firestore
                .doc('coll/doc')
                .listCollections()
                .then(collections => {
                chai_1.expect(collections[0].path).to.equal('coll/doc/first');
                chai_1.expect(collections[1].path).to.equal('coll/doc/second');
            });
        });
    });
});
describe('withConverter() support', () => {
    let firestore;
    beforeEach(() => {
        return helpers_1.createInstance().then(firestoreInstance => {
            firestore = firestoreInstance;
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('for DocumentReference.get()', async () => {
        const doc = helpers_1.document('documentId', 'author', 'author', 'title', 'post');
        const overrides = {
            commit: request => {
                const expectedRequest = helpers_1.set({
                    document: doc,
                });
                helpers_1.requestEquals(request, expectedRequest);
                return helpers_1.response(helpers_1.writeResult(1));
            },
            batchGetDocuments: () => {
                const stream = through2.obj();
                setImmediate(() => {
                    stream.push({ found: doc, readTime: { seconds: 5, nanos: 6 } });
                    stream.push(null);
                });
                return stream;
            },
        };
        return helpers_1.createInstance(overrides).then(async (firestore) => {
            const docRef = firestore
                .collection('collectionId')
                .doc('documentId')
                .withConverter(helpers_1.postConverter);
            await docRef.set(new helpers_1.Post('post', 'author'));
            const postData = await docRef.get();
            const post = postData.data();
            chai_1.expect(post).to.not.be.undefined;
            chai_1.expect(post.toString()).to.equal('post, by author');
        });
    });
});
//# sourceMappingURL=document.js.map