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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const src_1 = require("../src");
const util_1 = require("../src/util");
const helpers_1 = require("../test/util/helpers");
const version = require('../../package.json').version;
class DeferredPromise {
    constructor() {
        this.resolve = () => {
            throw new Error('DeferredPromise.resolve has not been initialized');
        };
        this.reject = () => {
            throw new Error('DeferredPromise.reject has not been initialized');
        };
        this.promise = null;
    }
}
if (process.env.NODE_ENV === 'DEBUG') {
    src_1.setLogFunction(console.log);
}
function getTestRoot(firestore) {
    return firestore.collection(`node_${version}_${util_1.autoId()}`);
}
describe('Firestore class', () => {
    let firestore;
    let randomCol;
    beforeEach(() => {
        firestore = new src_1.Firestore({});
        randomCol = getTestRoot(firestore);
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('has collection() method', () => {
        const ref = firestore.collection('col');
        chai_1.expect(ref.id).to.equal('col');
    });
    it('has doc() method', () => {
        const ref = firestore.doc('col/doc');
        chai_1.expect(ref.id).to.equal('doc');
    });
    it('has getAll() method', () => {
        const ref1 = randomCol.doc('doc1');
        const ref2 = randomCol.doc('doc2');
        return Promise.all([ref1.set({ foo: 'a' }), ref2.set({ foo: 'a' })])
            .then(() => {
            return firestore.getAll(ref1, ref2);
        })
            .then(docs => {
            chai_1.expect(docs.length).to.equal(2);
        });
    });
    it('getAll() supports array destructuring', () => {
        const ref1 = randomCol.doc('doc1');
        const ref2 = randomCol.doc('doc2');
        return Promise.all([ref1.set({ foo: 'a' }), ref2.set({ foo: 'a' })])
            .then(() => {
            return firestore.getAll(...[ref1, ref2]);
        })
            .then(docs => {
            chai_1.expect(docs.length).to.equal(2);
        });
    });
    it('getAll() supports field mask', () => {
        const ref1 = randomCol.doc('doc1');
        return ref1
            .set({ foo: 'a', bar: 'b' })
            .then(() => {
            return firestore.getAll(ref1, { fieldMask: ['foo'] });
        })
            .then(docs => {
            chai_1.expect(docs[0].data()).to.deep.equal({ foo: 'a' });
        });
    });
    it('getAll() supports array destructuring with field mask', () => {
        const ref1 = randomCol.doc('doc1');
        const ref2 = randomCol.doc('doc2');
        return Promise.all([ref1.set({ f: 'a', b: 'b' }), ref2.set({ f: 'a', b: 'b' })])
            .then(() => {
            return firestore.getAll(...[ref1, ref2], { fieldMask: ['f'] });
        })
            .then(docs => {
            chai_1.expect(docs[0].data()).to.deep.equal({ f: 'a' });
            chai_1.expect(docs[1].data()).to.deep.equal({ f: 'a' });
        });
    });
    it('getAll() supports generics', async () => {
        const ref1 = randomCol.doc('doc1').withConverter(helpers_1.postConverter);
        const ref2 = randomCol.doc('doc2').withConverter(helpers_1.postConverter);
        await ref1.set(new helpers_1.Post('post1', 'author1'));
        await ref2.set(new helpers_1.Post('post2', 'author2'));
        const docs = await firestore.getAll(ref1, ref2);
        chai_1.expect(docs[0].data().toString()).to.deep.equal('post1, by author1');
        chai_1.expect(docs[1].data().toString()).to.deep.equal('post2, by author2');
    });
    it('cannot make calls after the client has been terminated', () => {
        const ref1 = randomCol.doc('doc1');
        return firestore
            .terminate()
            .then(() => {
            return ref1.set({ foo: 100 });
        })
            .then(() => Promise.reject('set() should have failed'))
            .catch(err => {
            chai_1.expect(err).to.equal('The client has already been terminated');
        });
    });
});
describe('CollectionReference class', () => {
    let firestore;
    let randomCol;
    beforeEach(() => {
        firestore = new src_1.Firestore({});
        randomCol = getTestRoot(firestore);
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('has firestore property', () => {
        const ref = firestore.collection('col');
        chai_1.expect(ref.firestore).to.be.an.instanceOf(src_1.Firestore);
    });
    it('has id property', () => {
        const ref = firestore.collection('col');
        chai_1.expect(ref.id).to.equal('col');
    });
    it('has parent property', () => {
        const ref = firestore.collection('col/doc/col');
        chai_1.expect(ref.parent.id).to.equal('doc');
    });
    it('has path property', () => {
        const ref = firestore.collection('col/doc/col');
        chai_1.expect(ref.path).to.equal('col/doc/col');
    });
    it('has doc() method', () => {
        let ref = firestore.collection('col').doc('doc');
        chai_1.expect(ref.id).to.equal('doc');
        ref = firestore.collection('col').doc();
        chai_1.expect(ref.id).to.have.length(20);
    });
    it('has add() method', () => {
        return randomCol
            .add({ foo: 'a' })
            .then(ref => {
            return ref.get();
        })
            .then(doc => {
            chai_1.expect(doc.get('foo')).to.equal('a');
        });
    });
    it('lists missing documents', async () => {
        const batch = firestore.batch();
        batch.set(randomCol.doc('a'), {});
        batch.set(randomCol.doc('b/b/b'), {});
        batch.set(randomCol.doc('c'), {});
        await batch.commit();
        const documentRefs = await randomCol.listDocuments();
        const documents = await firestore.getAll(...documentRefs);
        const existingDocs = documents.filter(doc => doc.exists);
        const missingDocs = documents.filter(doc => !doc.exists);
        chai_1.expect(existingDocs.map(doc => doc.id)).to.have.members(['a', 'c']);
        chai_1.expect(missingDocs.map(doc => doc.id)).to.have.members(['b']);
    });
    it('supports withConverter()', async () => {
        const ref = firestore
            .collection('col')
            .withConverter(helpers_1.postConverter)
            .doc('doc');
        await ref.set(new helpers_1.Post('post', 'author'));
        const postData = await ref.get();
        const post = postData.data();
        chai_1.expect(post).to.not.be.undefined;
        chai_1.expect(post.toString()).to.equal('post, by author');
    });
});
describe('DocumentReference class', () => {
    let firestore;
    let randomCol;
    beforeEach(() => {
        firestore = new src_1.Firestore({});
        randomCol = getTestRoot(firestore);
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('has firestore property', () => {
        const ref = firestore.doc('col/doc');
        chai_1.expect(ref.firestore).to.be.an.instanceOf(src_1.Firestore);
    });
    it('has id property', () => {
        const ref = firestore.doc('col/doc');
        chai_1.expect(ref.id).to.equal('doc');
    });
    it('has parent property', () => {
        const ref = firestore.doc('col/doc');
        chai_1.expect(ref.parent.id).to.equal('col');
    });
    it('has path property', () => {
        const ref = firestore.doc('col/doc');
        chai_1.expect(ref.path).to.equal('col/doc');
    });
    it('has collection() method', () => {
        const ref = firestore.doc('col/doc').collection('subcol');
        chai_1.expect(ref.id).to.equal('subcol');
    });
    it('has create()/get() method', () => {
        const ref = randomCol.doc();
        return ref
            .create({ foo: 'a' })
            .then(() => {
            return ref.get();
        })
            .then(doc => {
            chai_1.expect(doc.get('foo')).to.equal('a');
        });
    });
    it('has set() method', () => {
        const allSupportedTypesObject = {
            stringValue: 'a',
            trueValue: true,
            falseValue: false,
            integerValue: 10,
            largeIntegerValue: 1234567890000,
            doubleValue: 0.1,
            infinityValue: Infinity,
            negativeInfinityValue: -Infinity,
            objectValue: { foo: 'bar', '😀': '😜' },
            emptyObject: {},
            dateValue: new src_1.Timestamp(479978400, 123000000),
            zeroDateValue: new src_1.Timestamp(0, 0),
            pathValue: firestore.doc('col1/ref1'),
            arrayValue: ['foo', 42, 'bar'],
            emptyArray: [],
            nilValue: null,
            geoPointValue: new src_1.GeoPoint(50.1430847, -122.947778),
            zeroGeoPointValue: new src_1.GeoPoint(0, 0),
            bytesValue: Buffer.from([0x01, 0x02]),
        };
        const ref = randomCol.doc('doc');
        return ref
            .set(allSupportedTypesObject)
            .then(() => {
            return ref.get();
        })
            .then(doc => {
            const data = doc.data();
            chai_1.expect(data.pathValue.path).to.equal(allSupportedTypesObject.pathValue.path);
            delete data.pathValue;
            delete allSupportedTypesObject.pathValue;
            chai_1.expect(data).to.deep.equal(allSupportedTypesObject);
        });
    });
    it('supports NaNs', () => {
        const nanObject = {
            nanValue: NaN,
        };
        const ref = randomCol.doc('doc');
        return ref
            .set(nanObject)
            .then(() => {
            return ref.get();
        })
            .then(doc => {
            const actualValue = doc.data().nanValue;
            chai_1.expect(actualValue).to.be.a('number');
            chai_1.expect(actualValue).to.be.NaN;
        });
    });
    it('supports server timestamps', () => {
        const baseObject = {
            a: 'bar',
            b: { remove: 'bar' },
            d: { keep: 'bar' },
            f: src_1.FieldValue.serverTimestamp(),
        };
        const updateObject = {
            a: src_1.FieldValue.serverTimestamp(),
            b: { c: src_1.FieldValue.serverTimestamp() },
            'd.e': src_1.FieldValue.serverTimestamp(),
        };
        const ref = randomCol.doc('doc');
        let setTimestamp;
        return ref
            .set(baseObject)
            .then(() => {
            return ref.get();
        })
            .then(doc => {
            setTimestamp = doc.get('f');
            chai_1.expect(setTimestamp).to.be.an.instanceOf(src_1.Timestamp);
            chai_1.expect(doc.data()).to.deep.equal({
                a: 'bar',
                b: { remove: 'bar' },
                d: { keep: 'bar' },
                f: setTimestamp,
            });
            return ref.update(updateObject);
        })
            .then(() => {
            return ref.get();
        })
            .then(doc => {
            const updateTimestamp = doc.get('a');
            chai_1.expect(setTimestamp).to.be.an.instanceOf(src_1.Timestamp);
            chai_1.expect(doc.data()).to.deep.equal({
                a: updateTimestamp,
                b: { c: updateTimestamp },
                d: { e: updateTimestamp, keep: 'bar' },
                f: setTimestamp,
            });
        });
    });
    it('supports increment()', () => {
        const baseData = { sum: 1 };
        const updateData = { sum: src_1.FieldValue.increment(1) };
        const expectedData = { sum: 2 };
        const ref = randomCol.doc('doc');
        return ref
            .set(baseData)
            .then(() => ref.update(updateData))
            .then(() => ref.get())
            .then(doc => {
            chai_1.expect(doc.data()).to.deep.equal(expectedData);
        });
    });
    it('supports arrayUnion()', () => {
        const baseObject = {
            a: [],
            b: ['foo'],
            c: { d: ['foo'] },
        };
        const updateObject = {
            a: src_1.FieldValue.arrayUnion('foo', 'bar'),
            b: src_1.FieldValue.arrayUnion('foo', 'bar'),
            'c.d': src_1.FieldValue.arrayUnion('foo', 'bar'),
        };
        const expectedObject = {
            a: ['foo', 'bar'],
            b: ['foo', 'bar'],
            c: { d: ['foo', 'bar'] },
        };
        const ref = randomCol.doc('doc');
        return ref
            .set(baseObject)
            .then(() => ref.update(updateObject))
            .then(() => ref.get())
            .then(doc => {
            chai_1.expect(doc.data()).to.deep.equal(expectedObject);
        });
    });
    it('supports arrayRemove()', () => {
        const baseObject = {
            a: [],
            b: ['foo', 'foo', 'baz'],
            c: { d: ['foo', 'bar', 'baz'] },
        };
        const updateObject = {
            a: src_1.FieldValue.arrayRemove('foo'),
            b: src_1.FieldValue.arrayRemove('foo'),
            'c.d': src_1.FieldValue.arrayRemove('foo', 'bar'),
        };
        const expectedObject = {
            a: [],
            b: ['baz'],
            c: { d: ['baz'] },
        };
        const ref = randomCol.doc('doc');
        return ref
            .set(baseObject)
            .then(() => ref.update(updateObject))
            .then(() => ref.get())
            .then(doc => {
            chai_1.expect(doc.data()).to.deep.equal(expectedObject);
        });
    });
    it('supports set() with merge', () => {
        const ref = randomCol.doc('doc');
        return ref
            .set({ 'a.1': 'foo', nested: { 'b.1': 'bar' } })
            .then(() => ref.set({ 'a.2': 'foo', nested: { 'b.2': 'bar' } }, { merge: true }))
            .then(() => ref.get())
            .then(doc => {
            const data = doc.data();
            chai_1.expect(data).to.deep.equal({
                'a.1': 'foo',
                'a.2': 'foo',
                nested: {
                    'b.1': 'bar',
                    'b.2': 'bar',
                },
            });
        });
    });
    it('supports server timestamps for merge', () => {
        const ref = randomCol.doc('doc');
        return ref
            .set({ a: 'b' })
            .then(() => ref.set({ c: src_1.FieldValue.serverTimestamp() }, { merge: true }))
            .then(() => ref.get())
            .then(doc => {
            const updateTimestamp = doc.get('c');
            chai_1.expect(updateTimestamp).to.be.an.instanceOf(src_1.Timestamp);
            chai_1.expect(doc.data()).to.deep.equal({
                a: 'b',
                c: updateTimestamp,
            });
        });
    });
    it('has update() method', () => {
        const ref = randomCol.doc('doc');
        return ref
            .set({ foo: 'a' })
            .then(res => {
            return ref.update({ foo: 'b' }, { lastUpdateTime: res.writeTime });
        })
            .then(() => {
            return ref.get();
        })
            .then(doc => {
            chai_1.expect(doc.get('foo')).to.equal('b');
        });
    });
    it('enforces that updated document exists', () => {
        return randomCol
            .doc()
            .update({ foo: 'b' })
            .catch(err => {
            chai_1.expect(err.message).to.match(/No document to update/);
        });
    });
    it('has delete() method', () => {
        let deleted = false;
        const ref = randomCol.doc('doc');
        return ref
            .set({ foo: 'a' })
            .then(() => {
            return ref.delete();
        })
            .then(() => {
            deleted = true;
            return ref.get();
        })
            .then(result => {
            chai_1.expect(deleted).to.be.true;
            chai_1.expect(result.exists).to.be.false;
        });
    });
    it('can delete() a non-existing document', () => {
        const ref = firestore.collection('col').doc();
        return ref.delete();
    });
    it('supports non-alphanumeric field names', () => {
        const ref = randomCol.doc('doc');
        return ref
            .set({ '!.\\`': { '!.\\`': 'value' } })
            .then(() => {
            return ref.get();
        })
            .then(doc => {
            chai_1.expect(doc.data()).to.deep.equal({ '!.\\`': { '!.\\`': 'value' } });
            return ref.update(new src_1.FieldPath('!.\\`', '!.\\`'), 'new-value');
        })
            .then(() => {
            return ref.get();
        })
            .then(doc => {
            chai_1.expect(doc.data()).to.deep.equal({ '!.\\`': { '!.\\`': 'new-value' } });
        });
    });
    it('has listCollections() method', () => {
        const collections = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
        const promises = [];
        for (const collection of collections) {
            promises.push(randomCol.doc(`doc/${collection}/doc`).create({}));
        }
        return Promise.all(promises)
            .then(() => {
            return randomCol.doc('doc').listCollections();
        })
            .then(response => {
            chai_1.expect(response).to.have.length(collections.length);
            for (let i = 0; i < response.length; ++i) {
                chai_1.expect(response[i].id).to.equal(collections[i]);
            }
        });
    });
    // tslint:disable-next-line:only-arrow-function
    it('can add and delete fields sequentially', function () {
        this.timeout(30 * 1000);
        const ref = randomCol.doc('doc');
        const actions = [
            () => ref.create({}),
            () => ref.delete(),
            () => ref.create({ a: { b: 'c' } }),
            () => ref.set({}, { merge: true }),
            () => ref.set({}),
            () => ref.set({ a: { b: 'c' } }),
            () => ref.set({ a: { d: 'e' } }, { merge: true }),
            () => ref.set({ a: { d: src_1.FieldValue.delete() } }, { merge: true }),
            () => ref.set({ a: { b: src_1.FieldValue.delete() } }, { merge: true }),
            () => ref.set({ a: { e: 'foo' } }, { merge: true }),
            () => ref.set({ f: 'foo' }, { merge: true }),
            () => ref.set({ f: { g: 'foo' } }, { merge: true }),
            () => ref.update({ 'f.h': 'foo' }),
            () => ref.update({ 'f.g': src_1.FieldValue.delete() }),
            () => ref.update({ 'f.h': src_1.FieldValue.delete() }),
            () => ref.update({ f: src_1.FieldValue.delete() }),
            () => ref.update({ 'i.j': {} }),
            () => ref.update({ 'i.j': { k: 'foo' } }),
            () => ref.update({ 'i.j': { l: {} } }),
            () => ref.update({ i: src_1.FieldValue.delete() }),
            () => ref.update({ a: src_1.FieldValue.delete() }),
        ];
        const expectedState = [
            {},
            null,
            { a: { b: 'c' } },
            { a: { b: 'c' } },
            {},
            { a: { b: 'c' } },
            { a: { b: 'c', d: 'e' } },
            { a: { b: 'c' } },
            { a: {} },
            { a: { e: 'foo' } },
            { a: { e: 'foo' }, f: 'foo' },
            { a: { e: 'foo' }, f: { g: 'foo' } },
            { a: { e: 'foo' }, f: { g: 'foo', h: 'foo' } },
            { a: { e: 'foo' }, f: { h: 'foo' } },
            { a: { e: 'foo' }, f: {} },
            { a: { e: 'foo' } },
            { a: { e: 'foo' }, i: { j: {} } },
            { a: { e: 'foo' }, i: { j: { k: 'foo' } } },
            { a: { e: 'foo' }, i: { j: { l: {} } } },
            { a: { e: 'foo' } },
            {},
        ];
        let promise = Promise.resolve();
        for (let i = 0; i < actions.length; ++i) {
            promise = promise
                .then(() => actions[i]())
                .then(() => {
                return ref.get();
            })
                .then(snap => {
                if (!snap.exists) {
                    chai_1.expect(expectedState[i]).to.be.null;
                }
                else {
                    chai_1.expect(snap.data()).to.deep.equal(expectedState[i]);
                }
            });
        }
        return promise;
    });
    // tslint:disable-next-line:only-arrow-function
    it('can add and delete fields with server timestamps', function () {
        this.timeout(10 * 1000);
        const ref = randomCol.doc('doc');
        const actions = [
            () => ref.create({
                time: src_1.FieldValue.serverTimestamp(),
                a: { b: src_1.FieldValue.serverTimestamp() },
            }),
            () => ref.set({
                time: src_1.FieldValue.serverTimestamp(),
                a: { c: src_1.FieldValue.serverTimestamp() },
            }),
            () => ref.set({
                time: src_1.FieldValue.serverTimestamp(),
                a: { d: src_1.FieldValue.serverTimestamp() },
            }, { merge: true }),
            () => ref.set({
                time: src_1.FieldValue.serverTimestamp(),
                e: src_1.FieldValue.serverTimestamp(),
            }, { merge: true }),
            () => ref.set({
                time: src_1.FieldValue.serverTimestamp(),
                e: { f: src_1.FieldValue.serverTimestamp() },
            }, { merge: true }),
            () => ref.update({
                time: src_1.FieldValue.serverTimestamp(),
                'g.h': src_1.FieldValue.serverTimestamp(),
            }),
            () => ref.update({
                time: src_1.FieldValue.serverTimestamp(),
                'g.j': { k: src_1.FieldValue.serverTimestamp() },
            }),
        ];
        const expectedState = [
            (times) => {
                return { time: times[0], a: { b: times[0] } };
            },
            (times) => {
                return { time: times[1], a: { c: times[1] } };
            },
            (times) => {
                return { time: times[2], a: { c: times[1], d: times[2] } };
            },
            (times) => {
                return { time: times[3], a: { c: times[1], d: times[2] }, e: times[3] };
            },
            (times) => {
                return {
                    time: times[4],
                    a: { c: times[1], d: times[2] },
                    e: { f: times[4] },
                };
            },
            (times) => {
                return {
                    time: times[5],
                    a: { c: times[1], d: times[2] },
                    e: { f: times[4] },
                    g: { h: times[5] },
                };
            },
            (times) => {
                return {
                    time: times[6],
                    a: { c: times[1], d: times[2] },
                    e: { f: times[4] },
                    g: { h: times[5], j: { k: times[6] } },
                };
            },
        ];
        let promise = Promise.resolve();
        const times = [];
        for (let i = 0; i < actions.length; ++i) {
            promise = promise
                .then(() => actions[i]())
                .then(() => {
                return ref.get();
            })
                .then(snap => {
                times.push(snap.get('time'));
                chai_1.expect(snap.data()).to.deep.equal(expectedState[i](times));
            });
        }
        return promise;
    });
    describe('watch', () => {
        const currentDeferred = new DeferredPromise();
        function resetPromise() {
            currentDeferred.promise = new Promise((resolve, reject) => {
                currentDeferred.resolve = resolve;
                currentDeferred.reject = reject;
            });
        }
        function waitForSnapshot() {
            return currentDeferred.promise.then(snapshot => {
                resetPromise();
                return snapshot;
            });
        }
        beforeEach(() => resetPromise());
        it('handles changing a doc', () => {
            const ref = randomCol.doc('doc');
            let readTime;
            let createTime;
            let updateTime;
            const unsubscribe = ref.onSnapshot(snapshot => {
                currentDeferred.resolve(snapshot);
            }, err => {
                currentDeferred.reject(err);
            });
            return waitForSnapshot()
                .then(snapshot => {
                chai_1.expect(snapshot.exists).to.be.false;
                // Add the document.
                return ref.set({ foo: 'a' });
            })
                .then(() => {
                return waitForSnapshot();
            })
                .then(snapshot => {
                chai_1.expect(snapshot.exists).to.be.true;
                chai_1.expect(snapshot.get('foo')).to.equal('a');
                readTime = snapshot.readTime;
                createTime = snapshot.createTime;
                updateTime = snapshot.updateTime;
                // Update documents.
                return ref.set({ foo: 'b' });
            })
                .then(() => {
                return waitForSnapshot();
            })
                .then(snapshot => {
                chai_1.expect(snapshot.exists).to.be.true;
                chai_1.expect(snapshot.get('foo')).to.equal('b');
                chai_1.expect(snapshot.createTime.isEqual(createTime)).to.be.true;
                chai_1.expect(snapshot.readTime.toMillis()).to.be.greaterThan(readTime.toMillis());
                chai_1.expect(snapshot.updateTime.toMillis()).to.be.greaterThan(updateTime.toMillis());
                unsubscribe();
            });
        });
        it('handles deleting a doc', () => {
            const ref = randomCol.doc('doc');
            const unsubscribe = ref.onSnapshot(snapshot => {
                currentDeferred.resolve(snapshot);
            }, err => {
                currentDeferred.reject(err);
            });
            return waitForSnapshot()
                .then(snapshot => {
                chai_1.expect(snapshot.exists).to.be.false;
                // Add the document.
                return ref.set({ foo: 'a' });
            })
                .then(() => {
                return waitForSnapshot();
            })
                .then(snapshot => {
                chai_1.expect(snapshot.exists).to.be.true;
                // Delete the document.
                return ref.delete();
            })
                .then(() => {
                return waitForSnapshot();
            })
                .then(snapshot => {
                chai_1.expect(snapshot.exists).to.be.false;
                unsubscribe();
            });
        });
        it('handles multiple docs', done => {
            const doc1 = randomCol.doc();
            const doc2 = randomCol.doc();
            let unsubscribe1;
            let unsubscribe2;
            // Documents transition from non-existent to existent to non-existent.
            const exists1 = [false, true, false];
            const exists2 = [false, true, false];
            const promises = [];
            // Code blocks to run after each step.
            const run = [
                () => {
                    promises.push(doc1.set({ foo: 'foo' }));
                    promises.push(doc2.set({ foo: 'foo' }));
                },
                () => {
                    promises.push(doc1.delete());
                    promises.push(doc2.delete());
                },
                () => {
                    unsubscribe1();
                    unsubscribe2();
                    Promise.all(promises).then(() => done());
                },
            ];
            const maybeRun = () => {
                if (exists1.length === exists2.length) {
                    run.shift()();
                }
            };
            unsubscribe1 = doc1.onSnapshot(snapshot => {
                chai_1.expect(snapshot.exists).to.equal(exists1.shift());
                maybeRun();
            });
            unsubscribe2 = doc2.onSnapshot(snapshot => {
                chai_1.expect(snapshot.exists).to.equal(exists2.shift());
                maybeRun();
            });
        });
        it('handles multiple streams on same doc', done => {
            const doc = randomCol.doc();
            let unsubscribe1;
            let unsubscribe2;
            // Document transitions from non-existent to existent to non-existent.
            const exists1 = [false, true, false];
            const exists2 = [false, true, false];
            const promises = [];
            // Code blocks to run after each step.
            const run = [
                () => {
                    promises.push(doc.set({ foo: 'foo' }));
                },
                () => {
                    promises.push(doc.delete());
                },
                () => {
                    unsubscribe1();
                    unsubscribe2();
                    Promise.all(promises).then(() => done());
                },
            ];
            const maybeRun = () => {
                if (exists1.length === exists2.length) {
                    run.shift()();
                }
            };
            unsubscribe1 = doc.onSnapshot(snapshot => {
                chai_1.expect(snapshot.exists).to.equal(exists1.shift());
                maybeRun();
            });
            unsubscribe2 = doc.onSnapshot(snapshot => {
                chai_1.expect(snapshot.exists).to.equal(exists2.shift());
                maybeRun();
            });
        });
        it('handles more than 100 concurrent listeners', async () => {
            const ref = randomCol.doc('doc');
            const emptyResults = [];
            const documentResults = [];
            const unsubscribeCallbacks = [];
            // A single GAPIC client can only handle 100 concurrent streams. We set
            // up 100+ long-lived listeners to verify that Firestore pools requests
            // across multiple clients.
            for (let i = 0; i < 150; ++i) {
                emptyResults[i] = new util_1.Deferred();
                documentResults[i] = new util_1.Deferred();
                unsubscribeCallbacks[i] = randomCol
                    .where('i', '>', i)
                    .onSnapshot(snapshot => {
                    if (snapshot.size === 0) {
                        emptyResults[i].resolve();
                    }
                    else if (snapshot.size === 1) {
                        documentResults[i].resolve();
                    }
                });
            }
            await Promise.all(emptyResults.map(d => d.promise));
            await ref.set({ i: 1337 });
            await Promise.all(documentResults.map(d => d.promise));
            unsubscribeCallbacks.forEach(c => c());
        });
        it('handles query snapshots with converters', async () => {
            const setupDeferred = new util_1.Deferred();
            const resultsDeferred = new util_1.Deferred();
            const ref = randomCol.doc('doc').withConverter(helpers_1.postConverter);
            const unsubscribe = randomCol
                .where('title', '==', 'post')
                .withConverter(helpers_1.postConverter)
                .onSnapshot(snapshot => {
                if (snapshot.size === 0) {
                    setupDeferred.resolve();
                }
                if (snapshot.size === 1) {
                    resultsDeferred.resolve(snapshot);
                }
            });
            await setupDeferred.promise;
            await ref.set(new helpers_1.Post('post', 'author'));
            const snapshot = await resultsDeferred.promise;
            chai_1.expect(snapshot.docs[0].data().toString()).to.equal('post, by author');
            unsubscribe();
        });
    });
    it('supports withConverter()', async () => {
        const ref = firestore
            .collection('col')
            .doc('doc')
            .withConverter(helpers_1.postConverter);
        await ref.set(new helpers_1.Post('post', 'author'));
        const postData = await ref.get();
        const post = postData.data();
        chai_1.expect(post).to.not.be.undefined;
        chai_1.expect(post.toString()).to.equal('post, by author');
    });
});
describe('Query class', () => {
    let firestore;
    let randomCol;
    const paginateResults = (query, startAfter) => {
        return (startAfter ? query.startAfter(startAfter) : query)
            .get()
            .then(snapshot => {
            if (snapshot.empty) {
                return { pages: 0, docs: [] };
            }
            else {
                const docs = snapshot.docs;
                return paginateResults(query, docs[docs.length - 1]).then(nextPage => {
                    return {
                        pages: nextPage.pages + 1,
                        docs: docs.concat(nextPage.docs),
                    };
                });
            }
        });
    };
    beforeEach(() => {
        firestore = new src_1.Firestore({});
        randomCol = getTestRoot(firestore);
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('has firestore property', () => {
        const ref = randomCol.limit(0);
        chai_1.expect(ref.firestore).to.be.an.instanceOf(src_1.Firestore);
    });
    it('has select() method', () => {
        const ref = randomCol.doc('doc');
        return ref
            .set({ foo: 'bar', bar: 'foo' })
            .then(() => {
            return randomCol.select('foo').get();
        })
            .then(res => {
            chai_1.expect(res.docs[0].data()).to.deep.equal({ foo: 'bar' });
        });
    });
    it('select() supports empty fields', () => {
        const ref = randomCol.doc('doc');
        return ref
            .set({ foo: 'bar', bar: 'foo' })
            .then(() => {
            return randomCol.select().get();
        })
            .then(res => {
            chai_1.expect(res.docs[0].ref.id).to.deep.equal('doc');
            chai_1.expect(res.docs[0].data()).to.deep.equal({});
        });
    });
    it('has where() method', () => {
        const ref = randomCol.doc('doc');
        return ref
            .set({ foo: 'bar' })
            .then(() => {
            return randomCol.where('foo', '==', 'bar').get();
        })
            .then(res => {
            chai_1.expect(res.docs[0].data()).to.deep.equal({ foo: 'bar' });
        });
    });
    it('supports NaN and Null', () => {
        const ref = randomCol.doc('doc');
        return ref
            .set({ foo: NaN, bar: null })
            .then(() => {
            return randomCol
                .where('foo', '==', NaN)
                .where('bar', '==', null)
                .get();
        })
            .then(res => {
            chai_1.expect(typeof res.docs[0].get('foo') === 'number' &&
                isNaN(res.docs[0].get('foo')));
            chai_1.expect(res.docs[0].get('bar')).to.equal(null);
        });
    });
    it('supports array-contains', () => {
        return Promise.all([
            randomCol.add({ foo: ['bar'] }),
            randomCol.add({ foo: [] }),
        ])
            .then(() => randomCol.where('foo', 'array-contains', 'bar').get())
            .then(res => {
            chai_1.expect(res.size).to.equal(1);
            chai_1.expect(res.docs[0].get('foo')).to.deep.equal(['bar']);
        });
    });
    it('supports in', () => {
        return Promise.all([
            randomCol.doc('a').set({ zip: 98101 }),
            randomCol.doc('b').set({ zip: 91102 }),
            randomCol.doc('c').set({ zip: 98103 }),
            randomCol.doc('d').set({ zip: [98101] }),
            randomCol.doc('e').set({ zip: ['98101', { zip: 98101 }] }),
            randomCol.doc('f').set({ zip: { zip: 98101 } }),
        ])
            .then(() => randomCol.where('zip', 'in', [98101, 98103]).get())
            .then(res => {
            chai_1.expect(res.size).to.equal(2);
            chai_1.expect(res.docs[0].data()).to.deep.equal({ zip: 98101 });
            chai_1.expect(res.docs[1].data()).to.deep.equal({ zip: 98103 });
        });
    });
    it('supports array-contains-any', () => {
        return Promise.all([
            randomCol.doc('a').set({ array: [42] }),
            randomCol.doc('b').set({ array: ['a', 42, 'c'] }),
            randomCol.doc('c').set({ array: [41.999, '42', { a: [42] }] }),
            randomCol.doc('d').set({ array: [42], array2: ['sigh'] }),
            randomCol.doc('e').set({ array: [43] }),
            randomCol.doc('f').set({ array: [{ a: 42 }] }),
            randomCol.doc('g').set({ array: 42 }),
        ])
            .then(() => randomCol.where('array', 'array-contains-any', [42, 43]).get())
            .then(res => {
            chai_1.expect(res.size).to.equal(4);
            chai_1.expect(res.docs[0].data()).to.deep.equal({ array: [42] });
            chai_1.expect(res.docs[1].data()).to.deep.equal({ array: ['a', 42, 'c'] });
            chai_1.expect(res.docs[2].data()).to.deep.equal({
                array: [42],
                array2: ['sigh'],
            });
            chai_1.expect(res.docs[3].data()).to.deep.equal({ array: [43] });
        });
    });
    it('can query by FieldPath.documentId()', () => {
        const ref = randomCol.doc('foo');
        return ref
            .set({})
            .then(() => {
            return randomCol.where(src_1.FieldPath.documentId(), '>=', 'bar').get();
        })
            .then(res => {
            chai_1.expect(res.docs.length).to.equal(1);
        });
    });
    it('has orderBy() method', () => {
        const ref1 = randomCol.doc('doc1');
        const ref2 = randomCol.doc('doc2');
        return Promise.all([ref1.set({ foo: 'a' }), ref2.set({ foo: 'b' })])
            .then(() => {
            return randomCol.orderBy('foo').get();
        })
            .then(res => {
            chai_1.expect(res.docs[0].data()).to.deep.equal({ foo: 'a' });
            chai_1.expect(res.docs[1].data()).to.deep.equal({ foo: 'b' });
            return randomCol.orderBy('foo', 'desc').get();
        })
            .then(res => {
            chai_1.expect(res.docs[0].data()).to.deep.equal({ foo: 'b' });
            chai_1.expect(res.docs[1].data()).to.deep.equal({ foo: 'a' });
        });
    });
    it('can order by FieldPath.documentId()', () => {
        const ref1 = randomCol.doc('doc1');
        const ref2 = randomCol.doc('doc2');
        return Promise.all([ref1.set({ foo: 'a' }), ref2.set({ foo: 'b' })])
            .then(() => {
            return randomCol.orderBy(src_1.FieldPath.documentId()).get();
        })
            .then(res => {
            chai_1.expect(res.docs[0].data()).to.deep.equal({ foo: 'a' });
            chai_1.expect(res.docs[1].data()).to.deep.equal({ foo: 'b' });
        });
    });
    it('has limit() method', () => {
        const ref1 = randomCol.doc('doc1');
        const ref2 = randomCol.doc('doc2');
        return Promise.all([ref1.set({ foo: 'a' }), ref2.set({ foo: 'b' })])
            .then(() => {
            return randomCol
                .orderBy('foo')
                .limit(1)
                .get();
        })
            .then(res => {
            chai_1.expect(res.size).to.equal(1);
            chai_1.expect(res.docs[0].data()).to.deep.equal({ foo: 'a' });
        });
    });
    it('has offset() method', () => {
        const ref1 = randomCol.doc('doc1');
        const ref2 = randomCol.doc('doc2');
        return Promise.all([ref1.set({ foo: 'a' }), ref2.set({ foo: 'b' })])
            .then(() => {
            return randomCol
                .orderBy('foo')
                .offset(1)
                .get();
        })
            .then(res => {
            chai_1.expect(res.size).to.equal(1);
            chai_1.expect(res.docs[0].data()).to.deep.equal({ foo: 'b' });
        });
    });
    it('has startAt() method', () => {
        const ref1 = randomCol.doc('doc1');
        const ref2 = randomCol.doc('doc2');
        return Promise.all([ref1.set({ foo: 'a' }), ref2.set({ foo: 'b' })])
            .then(() => {
            return randomCol
                .orderBy('foo')
                .startAt('a')
                .get();
        })
            .then(res => {
            chai_1.expect(res.docs[0].data()).to.deep.equal({ foo: 'a' });
        });
    });
    it('supports Unicode in document names', async () => {
        const collRef = randomCol.doc('доброеутро').collection('coll');
        await collRef.add({});
        const snapshot = await collRef.get();
        chai_1.expect(snapshot.size).to.equal(1);
    });
    it('supports pagination', () => {
        const batch = firestore.batch();
        for (let i = 0; i < 10; ++i) {
            batch.set(randomCol.doc('doc' + i), { val: i });
        }
        const query = randomCol.orderBy('val').limit(3);
        return batch
            .commit()
            .then(() => paginateResults(query))
            .then(results => {
            chai_1.expect(results.pages).to.equal(4);
            chai_1.expect(results.docs).to.have.length(10);
        });
    });
    it('supports pagination with where() clauses', () => {
        const batch = firestore.batch();
        for (let i = 0; i < 10; ++i) {
            batch.set(randomCol.doc('doc' + i), { val: i });
        }
        const query = randomCol.where('val', '>=', 1).limit(3);
        return batch
            .commit()
            .then(() => paginateResults(query))
            .then(results => {
            chai_1.expect(results.pages).to.equal(3);
            chai_1.expect(results.docs).to.have.length(9);
        });
    });
    it('supports pagination with array-contains filter', () => {
        const batch = firestore.batch();
        for (let i = 0; i < 10; ++i) {
            batch.set(randomCol.doc('doc' + i), { array: ['foo'] });
        }
        const query = randomCol.where('array', 'array-contains', 'foo').limit(3);
        return batch
            .commit()
            .then(() => paginateResults(query))
            .then(results => {
            chai_1.expect(results.pages).to.equal(4);
            chai_1.expect(results.docs).to.have.length(10);
        });
    });
    it('has startAfter() method', () => {
        const ref1 = randomCol.doc('doc1');
        const ref2 = randomCol.doc('doc2');
        return Promise.all([ref1.set({ foo: 'a' }), ref2.set({ foo: 'b' })])
            .then(() => {
            return randomCol
                .orderBy('foo')
                .startAfter('a')
                .get();
        })
            .then(res => {
            chai_1.expect(res.docs[0].data()).to.deep.equal({ foo: 'b' });
        });
    });
    it('has endAt() method', () => {
        const ref1 = randomCol.doc('doc1');
        const ref2 = randomCol.doc('doc2');
        return Promise.all([ref1.set({ foo: 'a' }), ref2.set({ foo: 'b' })])
            .then(() => {
            return randomCol
                .orderBy('foo')
                .endAt('b')
                .get();
        })
            .then(res => {
            chai_1.expect(res.size).to.equal(2);
            chai_1.expect(res.docs[0].data()).to.deep.equal({ foo: 'a' });
            chai_1.expect(res.docs[1].data()).to.deep.equal({ foo: 'b' });
        });
    });
    it('has endBefore() method', () => {
        const ref1 = randomCol.doc('doc1');
        const ref2 = randomCol.doc('doc2');
        return Promise.all([ref1.set({ foo: 'a' }), ref2.set({ foo: 'b' })])
            .then(() => {
            return randomCol
                .orderBy('foo')
                .endBefore('b')
                .get();
        })
            .then(res => {
            chai_1.expect(res.size).to.equal(1);
            chai_1.expect(res.docs[0].data()).to.deep.equal({ foo: 'a' });
        });
    });
    it('has stream() method', done => {
        let received = 0;
        const ref1 = randomCol.doc('doc1');
        const ref2 = randomCol.doc('doc2');
        Promise.all([ref1.set({ foo: 'a' }), ref2.set({ foo: 'b' })]).then(() => {
            return randomCol
                .stream()
                .on('data', d => {
                chai_1.expect(d).to.be.an.instanceOf(src_1.DocumentSnapshot);
                ++received;
            })
                .on('end', () => {
                chai_1.expect(received).to.equal(2);
                done();
            });
        });
    });
    it('stream() supports readable[Symbol.asyncIterator]()', async () => {
        var e_1, _a;
        let received = 0;
        await randomCol.doc().set({ foo: 'bar' });
        await randomCol.doc().set({ foo: 'bar' });
        const stream = randomCol.stream();
        try {
            for (var stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = await stream_1.next(), !stream_1_1.done;) {
                const chunk = stream_1_1.value;
                ++received;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (stream_1_1 && !stream_1_1.done && (_a = stream_1.return)) await _a.call(stream_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        chai_1.expect(received).to.equal(2);
    });
    it('can query collection groups', async () => {
        // Use `randomCol` to get a random collection group name to use but ensure
        // it starts with 'b' for predictable ordering.
        const collectionGroup = 'b' + randomCol.id;
        const docPaths = [
            `abc/123/${collectionGroup}/cg-doc1`,
            `abc/123/${collectionGroup}/cg-doc2`,
            `${collectionGroup}/cg-doc3`,
            `${collectionGroup}/cg-doc4`,
            `def/456/${collectionGroup}/cg-doc5`,
            `${collectionGroup}/virtual-doc/nested-coll/not-cg-doc`,
            `x${collectionGroup}/not-cg-doc`,
            `${collectionGroup}x/not-cg-doc`,
            `abc/123/${collectionGroup}x/not-cg-doc`,
            `abc/123/x${collectionGroup}/not-cg-doc`,
            `abc/${collectionGroup}`,
        ];
        const batch = firestore.batch();
        for (const docPath of docPaths) {
            batch.set(firestore.doc(docPath), { x: 1 });
        }
        await batch.commit();
        const querySnapshot = await firestore
            .collectionGroup(collectionGroup)
            .get();
        chai_1.expect(querySnapshot.docs.map(d => d.id)).to.deep.equal([
            'cg-doc1',
            'cg-doc2',
            'cg-doc3',
            'cg-doc4',
            'cg-doc5',
        ]);
    });
    it('can query collection groups with startAt / endAt by arbitrary documentId', async () => {
        // Use `randomCol` to get a random collection group name to use but
        // ensure it starts with 'b' for predictable ordering.
        const collectionGroup = 'b' + randomCol.id;
        const docPaths = [
            `a/a/${collectionGroup}/cg-doc1`,
            `a/b/a/b/${collectionGroup}/cg-doc2`,
            `a/b/${collectionGroup}/cg-doc3`,
            `a/b/c/d/${collectionGroup}/cg-doc4`,
            `a/c/${collectionGroup}/cg-doc5`,
            `${collectionGroup}/cg-doc6`,
            `a/b/nope/nope`,
        ];
        const batch = firestore.batch();
        for (const docPath of docPaths) {
            batch.set(firestore.doc(docPath), { x: 1 });
        }
        await batch.commit();
        let querySnapshot = await firestore
            .collectionGroup(collectionGroup)
            .orderBy(src_1.FieldPath.documentId())
            .startAt(`a/b`)
            .endAt('a/b0')
            .get();
        chai_1.expect(querySnapshot.docs.map(d => d.id)).to.deep.equal([
            'cg-doc2',
            'cg-doc3',
            'cg-doc4',
        ]);
        querySnapshot = await firestore
            .collectionGroup(collectionGroup)
            .orderBy(src_1.FieldPath.documentId())
            .startAfter('a/b')
            .endBefore(`a/b/${collectionGroup}/cg-doc3`)
            .get();
        chai_1.expect(querySnapshot.docs.map(d => d.id)).to.deep.equal(['cg-doc2']);
    });
    it('can query collection groups with where filters on arbitrary documentId', async () => {
        // Use `randomCol` to get a random collection group name to use but
        // ensure it starts with 'b' for predictable ordering.
        const collectionGroup = 'b' + randomCol.id;
        const docPaths = [
            `a/a/${collectionGroup}/cg-doc1`,
            `a/b/a/b/${collectionGroup}/cg-doc2`,
            `a/b/${collectionGroup}/cg-doc3`,
            `a/b/c/d/${collectionGroup}/cg-doc4`,
            `a/c/${collectionGroup}/cg-doc5`,
            `${collectionGroup}/cg-doc6`,
            `a/b/nope/nope`,
        ];
        const batch = firestore.batch();
        for (const docPath of docPaths) {
            batch.set(firestore.doc(docPath), { x: 1 });
        }
        await batch.commit();
        let querySnapshot = await firestore
            .collectionGroup(collectionGroup)
            .where(src_1.FieldPath.documentId(), '>=', `a/b`)
            .where(src_1.FieldPath.documentId(), '<=', 'a/b0')
            .get();
        chai_1.expect(querySnapshot.docs.map(d => d.id)).to.deep.equal([
            'cg-doc2',
            'cg-doc3',
            'cg-doc4',
        ]);
        querySnapshot = await firestore
            .collectionGroup(collectionGroup)
            .where(src_1.FieldPath.documentId(), '>', `a/b`)
            .where(src_1.FieldPath.documentId(), '<', `a/b/${collectionGroup}/cg-doc3`)
            .get();
        chai_1.expect(querySnapshot.docs.map(d => d.id)).to.deep.equal(['cg-doc2']);
    });
    it('can query large collections', async () => {
        // @grpc/grpc-js v0.4.1 failed to deliver the full set of query results for
        // larger collections (https://github.com/grpc/grpc-node/issues/895);
        const batch = firestore.batch();
        for (let i = 0; i < 100; ++i) {
            batch.create(randomCol.doc(), {});
        }
        await batch.commit();
        const snapshot = await randomCol.get();
        chai_1.expect(snapshot.size).to.equal(100);
    });
    describe('watch', () => {
        const currentDeferred = new DeferredPromise();
        const snapshot = (id, data) => {
            const ref = randomCol.doc(id);
            const fields = ref.firestore._serializer.encodeFields(data);
            return randomCol.firestore.snapshot_({
                name: 'projects/ignored/databases/(default)/documents/' +
                    ref._path.relativeName,
                fields,
                createTime: { seconds: 0, nanos: 0 },
                updateTime: { seconds: 0, nanos: 0 },
            }, { seconds: 0, nanos: 0 });
        };
        const docChange = (type, id, data) => {
            return {
                type,
                doc: snapshot(id, data),
            };
        };
        const added = (id, data) => docChange('added', id, data);
        const modified = (id, data) => docChange('modified', id, data);
        const removed = (id, data) => docChange('removed', id, data);
        function resetPromise() {
            currentDeferred.promise = new Promise((resolve, reject) => {
                currentDeferred.resolve = resolve;
                currentDeferred.reject = reject;
            });
        }
        function waitForSnapshot() {
            return currentDeferred.promise.then(snapshot => {
                resetPromise();
                return snapshot;
            });
        }
        function snapshotsEqual(actual, expected) {
            let i;
            chai_1.expect(actual.size).to.equal(expected.docs.length);
            for (i = 0; i < expected.docs.length && i < actual.size; i++) {
                chai_1.expect(actual.docs[i].ref.id).to.equal(expected.docs[i].ref.id);
                chai_1.expect(actual.docs[i].data()).to.deep.equal(expected.docs[i].data());
            }
            const actualDocChanges = actual.docChanges();
            chai_1.expect(actualDocChanges.length).to.equal(expected.docChanges.length);
            for (i = 0; i < expected.docChanges.length; i++) {
                chai_1.expect(actualDocChanges[i].type).to.equal(expected.docChanges[i].type);
                chai_1.expect(actualDocChanges[i].doc.ref.id).to.equal(expected.docChanges[i].doc.ref.id);
                chai_1.expect(actualDocChanges[i].doc.data()).to.deep.equal(expected.docChanges[i].doc.data());
                chai_1.expect(actualDocChanges[i].doc.readTime).to.exist;
                chai_1.expect(actualDocChanges[i].doc.createTime).to.exist;
                chai_1.expect(actualDocChanges[i].doc.updateTime).to.exist;
            }
            chai_1.expect(actual.readTime).to.exist;
        }
        beforeEach(() => resetPromise());
        it('handles changing a doc', () => {
            const ref1 = randomCol.doc('doc1');
            const ref2 = randomCol.doc('doc2');
            const unsubscribe = randomCol.onSnapshot(snapshot => {
                currentDeferred.resolve(snapshot);
            }, err => {
                currentDeferred.reject(err);
            });
            return waitForSnapshot()
                .then(results => {
                snapshotsEqual(results, { docs: [], docChanges: [] });
                // Add a result.
                return ref1.set({ foo: 'a' });
            })
                .then(() => {
                return waitForSnapshot();
            })
                .then(results => {
                snapshotsEqual(results, {
                    docs: [snapshot('doc1', { foo: 'a' })],
                    docChanges: [added('doc1', { foo: 'a' })],
                });
                // Add another result.
                return ref2.set({ foo: 'b' });
            })
                .then(() => {
                return waitForSnapshot();
            })
                .then(results => {
                snapshotsEqual(results, {
                    docs: [snapshot('doc1', { foo: 'a' }), snapshot('doc2', { foo: 'b' })],
                    docChanges: [added('doc2', { foo: 'b' })],
                });
                // Change a result.
                return ref2.set({ bar: 'c' });
            })
                .then(() => {
                return waitForSnapshot();
            })
                .then(results => {
                snapshotsEqual(results, {
                    docs: [snapshot('doc1', { foo: 'a' }), snapshot('doc2', { bar: 'c' })],
                    docChanges: [modified('doc2', { bar: 'c' })],
                });
                unsubscribe();
            });
        });
        it("handles changing a doc so it doesn't match", () => {
            const ref1 = randomCol.doc('doc1');
            const ref2 = randomCol.doc('doc2');
            const query = randomCol.where('included', '==', 'yes');
            const unsubscribe = query.onSnapshot(snapshot => {
                currentDeferred.resolve(snapshot);
            }, err => {
                currentDeferred.reject(err);
            });
            return waitForSnapshot()
                .then(results => {
                snapshotsEqual(results, { docs: [], docChanges: [] });
                // Add a result.
                return ref1.set({ included: 'yes' });
            })
                .then(() => {
                return waitForSnapshot();
            })
                .then(results => {
                snapshotsEqual(results, {
                    docs: [snapshot('doc1', { included: 'yes' })],
                    docChanges: [added('doc1', { included: 'yes' })],
                });
                // Add another result.
                return ref2.set({ included: 'yes' });
            })
                .then(() => {
                return waitForSnapshot();
            })
                .then(results => {
                snapshotsEqual(results, {
                    docs: [
                        snapshot('doc1', { included: 'yes' }),
                        snapshot('doc2', { included: 'yes' }),
                    ],
                    docChanges: [added('doc2', { included: 'yes' })],
                });
                // Change a result.
                return ref2.set({ included: 'no' });
            })
                .then(() => {
                return waitForSnapshot();
            })
                .then(results => {
                snapshotsEqual(results, {
                    docs: [snapshot('doc1', { included: 'yes' })],
                    docChanges: [removed('doc2', { included: 'yes' })],
                });
                unsubscribe();
            });
        });
        it('handles deleting a doc', () => {
            const ref1 = randomCol.doc('doc1');
            const ref2 = randomCol.doc('doc2');
            const unsubscribe = randomCol.onSnapshot(snapshot => {
                currentDeferred.resolve(snapshot);
            }, err => {
                currentDeferred.reject(err);
            });
            return waitForSnapshot()
                .then(results => {
                snapshotsEqual(results, { docs: [], docChanges: [] });
                // Add a result.
                return ref1.set({ included: 'yes' });
            })
                .then(() => {
                return waitForSnapshot();
            })
                .then(results => {
                snapshotsEqual(results, {
                    docs: [snapshot('doc1', { included: 'yes' })],
                    docChanges: [added('doc1', { included: 'yes' })],
                });
                // Add another result.
                return ref2.set({ included: 'yes' });
            })
                .then(() => {
                return waitForSnapshot();
            })
                .then(results => {
                snapshotsEqual(results, {
                    docs: [
                        snapshot('doc1', { included: 'yes' }),
                        snapshot('doc2', { included: 'yes' }),
                    ],
                    docChanges: [added('doc2', { included: 'yes' })],
                });
                // Delete a result.
                return ref2.delete();
            })
                .then(() => {
                return waitForSnapshot();
            })
                .then(results => {
                snapshotsEqual(results, {
                    docs: [snapshot('doc1', { included: 'yes' })],
                    docChanges: [removed('doc2', { included: 'yes' })],
                });
                unsubscribe();
            });
        });
    });
});
describe('Transaction class', () => {
    let firestore;
    let randomCol;
    beforeEach(() => {
        firestore = new src_1.Firestore({});
        randomCol = getTestRoot(firestore);
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('has get() method', () => {
        const ref = randomCol.doc('doc');
        return ref
            .set({ foo: 'bar' })
            .then(() => {
            return firestore.runTransaction(updateFunction => {
                return updateFunction.get(ref).then(doc => {
                    return Promise.resolve(doc.get('foo'));
                });
            });
        })
            .then(res => {
            chai_1.expect(res).to.equal('bar');
        });
    });
    it('has getAll() method', () => {
        const ref1 = randomCol.doc('doc1');
        const ref2 = randomCol.doc('doc2');
        return Promise.all([ref1.set({}), ref2.set({})])
            .then(() => {
            return firestore.runTransaction(updateFunction => {
                return updateFunction.getAll(ref1, ref2).then(docs => {
                    return Promise.resolve(docs.length);
                });
            });
        })
            .then(res => {
            chai_1.expect(res).to.equal(2);
        });
    });
    it('getAll() supports array destructuring', () => {
        const ref1 = randomCol.doc('doc1');
        const ref2 = randomCol.doc('doc2');
        return Promise.all([ref1.set({}), ref2.set({})])
            .then(() => {
            return firestore.runTransaction(updateFunction => {
                return updateFunction.getAll(...[ref1, ref2]).then(docs => {
                    return Promise.resolve(docs.length);
                });
            });
        })
            .then(res => {
            chai_1.expect(res).to.equal(2);
        });
    });
    it('getAll() supports field mask', () => {
        const ref1 = randomCol.doc('doc1');
        return ref1.set({ foo: 'a', bar: 'b' }).then(() => {
            return firestore
                .runTransaction(updateFunction => {
                return updateFunction
                    .getAll(ref1, { fieldMask: ['foo'] })
                    .then(([doc]) => doc);
            })
                .then(doc => {
                chai_1.expect(doc.data()).to.deep.equal({ foo: 'a' });
            });
        });
    });
    it('getAll() supports array destructuring with field mask', () => {
        const ref1 = randomCol.doc('doc1');
        const ref2 = randomCol.doc('doc2');
        return Promise.all([
            ref1.set({ f: 'a', b: 'b' }),
            ref2.set({ f: 'a', b: 'b' }),
        ]).then(() => {
            return firestore
                .runTransaction(updateFunction => {
                return updateFunction
                    .getAll(...[ref1, ref2], { fieldMask: ['f'] })
                    .then(docs => docs);
            })
                .then(docs => {
                chai_1.expect(docs[0].data()).to.deep.equal({ f: 'a' });
                chai_1.expect(docs[1].data()).to.deep.equal({ f: 'a' });
            });
        });
    });
    it('getAll() supports withConverter()', async () => {
        const ref1 = randomCol.doc('doc1').withConverter(helpers_1.postConverter);
        const ref2 = randomCol.doc('doc2').withConverter(helpers_1.postConverter);
        await ref1.set(new helpers_1.Post('post1', 'author1'));
        await ref2.set(new helpers_1.Post('post2', 'author2'));
        const docs = await firestore.runTransaction(updateFunction => {
            return updateFunction.getAll(ref1, ref2);
        });
        chai_1.expect(docs[0].data().toString()).to.equal('post1, by author1');
        chai_1.expect(docs[1].data().toString()).to.equal('post2, by author2');
    });
    it('set() and get() support withConverter()', async () => {
        const ref = randomCol.doc('doc1').withConverter(helpers_1.postConverter);
        await ref.set(new helpers_1.Post('post', 'author'));
        await firestore.runTransaction(async (txn) => {
            await txn.get(ref);
            await txn.set(ref, new helpers_1.Post('new post', 'author'));
        });
        const doc = await ref.get();
        chai_1.expect(doc.data().toString()).to.equal('new post, by author');
    });
    it('has get() with query', () => {
        const ref = randomCol.doc('doc');
        const query = randomCol.where('foo', '==', 'bar');
        return ref
            .set({ foo: 'bar' })
            .then(() => {
            return firestore.runTransaction(updateFunction => {
                return updateFunction.get(query).then(res => {
                    return Promise.resolve(res.docs[0].get('foo'));
                });
            });
        })
            .then(res => {
            chai_1.expect(res).to.equal('bar');
        });
    });
    it('has set() method', () => {
        const ref = randomCol.doc('doc');
        return firestore
            .runTransaction(updateFunction => {
            updateFunction.set(ref, { foo: 'foobar' });
            return Promise.resolve();
        })
            .then(() => {
            return ref.get();
        })
            .then(doc => {
            chai_1.expect(doc.get('foo')).to.equal('foobar');
        });
    });
    it('has update() method', () => {
        const ref = randomCol.doc('doc');
        return ref
            .set({ foo: 'bar' })
            .then(() => {
            return firestore.runTransaction(updateFunction => {
                return updateFunction.get(ref).then(() => {
                    updateFunction.update(ref, { foo: 'foobar' });
                });
            });
        })
            .then(() => {
            return ref.get();
        })
            .then(doc => {
            chai_1.expect(doc.get('foo')).to.equal('foobar');
        });
    });
    it('enforces that updated document exists', () => {
        const ref = firestore.collection('col').doc();
        return firestore
            .runTransaction(updateFunction => {
            updateFunction.update(ref, { foo: 'b' });
            return Promise.resolve();
        })
            .then(() => {
            chai_1.expect.fail();
        })
            .catch(err => {
            chai_1.expect(err.message).to.match(/No document to update/);
        });
    });
    it('has delete() method', () => {
        let success = false;
        const ref = randomCol.doc('doc');
        return ref
            .set({ foo: 'bar' })
            .then(() => {
            return firestore.runTransaction(updateFunction => {
                updateFunction.delete(ref);
                return Promise.resolve();
            });
        })
            .then(() => {
            success = true;
            return ref.get();
        })
            .then(result => {
            chai_1.expect(success).to.be.true;
            chai_1.expect(result.exists).to.be.false;
        });
    });
});
describe('WriteBatch class', () => {
    let firestore;
    let randomCol;
    beforeEach(() => {
        firestore = new src_1.Firestore({});
        randomCol = getTestRoot(firestore);
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('supports empty batches', () => {
        return firestore.batch().commit();
    });
    it('has create() method', () => {
        const ref = randomCol.doc();
        const batch = firestore.batch();
        batch.create(ref, { foo: 'a' });
        return batch
            .commit()
            .then(() => {
            return ref.get();
        })
            .then(doc => {
            chai_1.expect(doc.get('foo')).to.equal('a');
        });
    });
    it('has set() method', () => {
        const ref = randomCol.doc('doc');
        const batch = firestore.batch();
        batch.set(ref, { foo: 'a' });
        return batch
            .commit()
            .then(() => {
            return ref.get();
        })
            .then(doc => {
            chai_1.expect(doc.get('foo')).to.equal('a');
        });
    });
    it('has update() method', () => {
        const ref = randomCol.doc('doc');
        const batch = firestore.batch();
        batch.set(ref, { foo: 'a' });
        batch.update(ref, { foo: 'b' });
        return batch
            .commit()
            .then(() => {
            return ref.get();
        })
            .then(doc => {
            chai_1.expect(doc.get('foo')).to.equal('b');
        });
    });
    it('omits document transforms from write results', () => {
        const batch = firestore.batch();
        batch.set(randomCol.doc(), { foo: 'a' });
        batch.set(randomCol.doc(), { foo: src_1.FieldValue.serverTimestamp() });
        return batch.commit().then(writeResults => {
            chai_1.expect(writeResults).to.have.length(2);
        });
    });
    it('enforces that updated document exists', () => {
        const ref = randomCol.doc();
        const batch = firestore.batch();
        batch.update(ref, { foo: 'b' });
        return batch
            .commit()
            .then(() => {
            chai_1.expect.fail();
        })
            .catch(err => {
            chai_1.expect(err.message.match(/No document to update/));
        });
    });
    it('has delete() method', () => {
        let success = false;
        const ref = randomCol.doc('doc');
        const batch = firestore.batch();
        batch.set(ref, { foo: 'a' });
        batch.delete(ref);
        return batch
            .commit()
            .then(() => {
            success = true;
            return ref.get();
        })
            .then(result => {
            chai_1.expect(success).to.be.true;
            chai_1.expect(result.exists).to.be.false;
        });
    });
});
describe('QuerySnapshot class', () => {
    let firestore;
    let querySnapshot;
    beforeEach(() => {
        firestore = new src_1.Firestore({});
        const randomCol = getTestRoot(firestore);
        const ref1 = randomCol.doc('doc1');
        const ref2 = randomCol.doc('doc2');
        querySnapshot = Promise.all([
            ref1.set({ foo: 'a' }),
            ref2.set({ foo: 'a' }),
        ]).then(() => {
            return randomCol.get();
        });
    });
    afterEach(() => helpers_1.verifyInstance(firestore));
    it('has query property', () => {
        return querySnapshot
            .then(snapshot => {
            return snapshot.query.get();
        })
            .then(snapshot => {
            chai_1.expect(snapshot.size).to.equal(2);
        });
    });
    it('has empty property', () => {
        return querySnapshot
            .then(snapshot => {
            chai_1.expect(snapshot.empty).to.be.false;
            chai_1.expect(snapshot.readTime).to.exist;
            return snapshot.query.where('foo', '==', 'bar').get();
        })
            .then(snapshot => {
            chai_1.expect(snapshot.empty).to.be.true;
            chai_1.expect(snapshot.readTime).to.exist;
        });
    });
    it('has size property', () => {
        return querySnapshot.then(snapshot => {
            chai_1.expect(snapshot.size).to.equal(2);
        });
    });
    it('has docs property', () => {
        return querySnapshot.then(snapshot => {
            chai_1.expect(snapshot.docs).to.have.length(2);
            chai_1.expect(snapshot.docs[0].get('foo')).to.equal('a');
        });
    });
    it('has forEach() method', () => {
        let count = 0;
        return querySnapshot.then(snapshot => {
            snapshot.forEach(doc => {
                chai_1.expect(doc.get('foo')).to.equal('a');
                ++count;
            });
            chai_1.expect(count).to.equal(2);
        });
    });
});
//# sourceMappingURL=firestore.js.map