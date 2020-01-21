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
const FirebaseFirestore = require("../src");
var FieldPath = FirebaseFirestore.FieldPath;
var FieldValue = FirebaseFirestore.FieldValue;
var Firestore = FirebaseFirestore.Firestore;
var GeoPoint = FirebaseFirestore.GeoPoint;
var Timestamp = FirebaseFirestore.Timestamp;
// This test verifies the Typescript typings and is not meant for execution.
xdescribe('firestore.d.ts', () => {
    const firestore = new Firestore({
        keyFilename: 'foo',
        projectId: 'foo',
        host: 'localhost',
        ssl: false,
        otherOption: 'foo',
    });
    const precondition = { lastUpdateTime: Timestamp.now() };
    const setOptions = { merge: true };
    const fieldPath = new FieldPath('foo');
    const docRef = firestore.doc('coll/doc');
    const collRef = firestore.collection('coll');
    const updateData = {};
    const documentData = {};
    const defaultConverter = {
        toFirestore(modelObject) {
            return modelObject;
        },
        fromFirestore(data) {
            return data;
        },
    };
    FirebaseFirestore.setLogFunction(console.log);
    it('has typings for Firestore', () => {
        firestore.settings({
            keyFilename: 'foo',
            projectId: 'foo',
            maxIdleChannels: 42,
            otherOption: 'foo',
        });
        const collRef = firestore.collection('coll');
        const docRef1 = firestore.doc('coll/doc');
        const docRef2 = firestore.doc('coll/doc');
        const collectionGroup = firestore.collectionGroup('collectionId');
        firestore.getAll(docRef1, docRef2).then((docs) => { });
        firestore
            .getAll(docRef1, docRef2, {})
            .then((docs) => { });
        firestore
            .getAll(docRef1, docRef2, { fieldMask: ['foo', new FieldPath('foo')] })
            .then((docs) => { });
        firestore
            .listCollections()
            .then((collections) => { });
        const transactionResult = firestore.runTransaction((updateFunction) => {
            return Promise.resolve('string');
        });
        const batch = firestore.batch();
    });
    it('has typings for GeoPoint', () => {
        const geoPoint = new GeoPoint(90.0, 90.0);
        const latitude = geoPoint.latitude;
        const longitude = geoPoint.longitude;
        const equals = geoPoint.isEqual(geoPoint);
    });
    it('has typings for Transaction', () => {
        return firestore.runTransaction((transaction) => {
            transaction.get(collRef).then((snapshot) => { });
            transaction.get(docRef).then((doc) => { });
            transaction.getAll(docRef, docRef).then((docs) => { });
            transaction = transaction.create(docRef, documentData);
            transaction = transaction.set(docRef, documentData);
            transaction = transaction.set(docRef, documentData, setOptions);
            transaction = transaction.update(docRef, updateData);
            transaction = transaction.update(docRef, updateData, precondition);
            transaction = transaction.update(docRef, 'foo', 'bar');
            transaction = transaction.update(docRef, 'foo', 'bar', precondition);
            transaction = transaction.update(docRef, new FieldPath('foo'), 'bar');
            transaction = transaction.update(docRef, new FieldPath('foo'), 'bar', precondition);
            transaction = transaction.delete(docRef);
            transaction = transaction.delete(docRef, precondition);
            return Promise.resolve();
        });
    });
    it('has typings for WriteBatch', () => {
        let batch = firestore.batch();
        batch = batch.create(docRef, documentData);
        batch = batch.set(docRef, documentData);
        batch = batch.set(docRef, documentData, setOptions);
        batch = batch.update(docRef, updateData);
        batch = batch.update(docRef, updateData, precondition);
        batch = batch.update(docRef, 'foo', 'bar');
        batch = batch.update(docRef, 'foo', 'bar', precondition);
        batch = batch.update(docRef, new FieldPath('foo'), 'bar');
        batch = batch.update(docRef, new FieldPath('foo'), 'bar', precondition);
        batch = batch.delete(docRef);
        batch = batch.delete(docRef, precondition);
        batch.commit().then((result) => { });
    });
    it('has typings for WriteResult', () => {
        docRef.set(documentData).then((result) => {
            const writeTime = result.writeTime;
            const equals = result.isEqual(result);
        });
    });
    it('has typings for FieldPath', () => {
        const path1 = new FieldPath('a');
        const path2 = new FieldPath('a', 'b');
        const path3 = FieldPath.documentId();
        const equals = path1.isEqual(path2);
    });
    it('has typings for DocumentReference', () => {
        const id = docRef.id;
        const firestore = docRef.firestore;
        const parent = docRef.parent;
        const path = docRef.path;
        const subcollection = docRef.collection('coll');
        docRef.listCollections().then((collections) => { });
        docRef.get().then((snapshot) => { });
        docRef.withConverter(defaultConverter);
        docRef
            .create(documentData)
            .then((writeResult) => { });
        docRef
            .set(documentData)
            .then((writeResult) => { });
        docRef
            .set(documentData, setOptions)
            .then((writeResult) => { });
        docRef
            .update(updateData)
            .then((writeResult) => { });
        docRef
            .update(updateData, precondition)
            .then((writeResult) => { });
        docRef
            .update('foo', 'bar')
            .then((writeResult) => { });
        docRef
            .update('foo', 'bar', precondition)
            .then((writeResult) => { });
        docRef
            .update(new FieldPath('foo'), 'bar')
            .then((writeResult) => { });
        docRef
            .update(new FieldPath('foo'), 'bar', precondition)
            .then((writeResult) => { });
        docRef.delete().then((writeResult) => { });
        docRef
            .delete(precondition)
            .then((writeResult) => { });
        let unsubscribe = docRef.onSnapshot((snapshot) => { });
        unsubscribe = docRef.onSnapshot((snapshot) => { }, (error) => { });
        const equals = docRef.isEqual(docRef);
    });
    it('has typings for DocumentSnapshot', () => {
        docRef.get().then((snapshot) => {
            const exists = snapshot.exists;
            const ref = snapshot.ref;
            const id = snapshot.id;
            const readTime = snapshot.readTime;
            const updateTime = snapshot.updateTime;
            const createTime = snapshot.createTime;
            const data = snapshot.data();
            let value = snapshot.get('foo');
            value = snapshot.get(new FieldPath('foo'));
            const equals = snapshot.isEqual(snapshot);
        });
    });
    it('has typings for QueryDocumentSnapshot', () => {
        collRef.get().then((querySnapshot) => {
            const snapshot = querySnapshot.docs[0];
            const exists = snapshot.exists;
            const ref = snapshot.ref;
            const id = snapshot.id;
            const readTime = snapshot.readTime;
            const updateTime = snapshot.updateTime;
            const createTime = snapshot.createTime;
            const data = snapshot.data();
            let value = snapshot.get('foo');
            value = snapshot.get(new FieldPath('foo'));
            const equals = snapshot.isEqual(snapshot);
        });
    });
    it('has typings for Query', () => {
        let query = collRef;
        const firestore = collRef.firestore;
        docRef.get().then((snapshot) => {
            query = query.where('foo', '<', 'bar');
            query = query.where('foo', '<=', 'bar');
            query = query.where('foo', '==', 'bar');
            query = query.where('foo', '>=', 'bar');
            query = query.where('foo', '>', 'bar');
            query = query.where('foo', 'array-contains', 'bar');
            query = query.where('foo', 'in', ['bar']);
            query = query.where('foo', 'array-contains-any', ['bar']);
            query = query.where(new FieldPath('foo'), '==', 'bar');
            query = query.orderBy('foo');
            query = query.orderBy('foo', 'asc');
            query = query.orderBy(new FieldPath('foo'));
            query = query.orderBy(new FieldPath('foo'), 'desc');
            query = query.limit(42);
            query = query.offset(42);
            query = query.select('foo');
            query = query.select('foo', 'bar');
            query = query.select(new FieldPath('foo'));
            query = query.select(new FieldPath('foo'), new FieldPath('bar'));
            query = query.startAt(snapshot);
            query = query.startAt('foo');
            query = query.startAt('foo', 'bar');
            query = query.startAfter(snapshot);
            query = query.startAfter('foo');
            query = query.startAfter('foo', 'bar');
            query = query.endAt(snapshot);
            query = query.endAt('foo');
            query = query.endAt('foo', 'bar');
            query = query.endBefore(snapshot);
            query = query.endBefore('foo');
            query = query.endBefore('foo', 'bar');
            query = query.withConverter(defaultConverter);
            query.get().then((results) => { });
            query.stream().on('data', () => { });
            let unsubscribe = query.onSnapshot((snapshot) => { });
            unsubscribe = query.onSnapshot((snapshot) => { }, (error) => { });
            const equals = query.isEqual(query);
        });
    });
    it('has typings for QuerySnapshot', () => {
        collRef.get().then((snapshot) => {
            const query = snapshot.query;
            const docChanges = snapshot.docChanges();
            const docs = snapshot.docs;
            const size = snapshot.size;
            const empty = snapshot.empty;
            const readTime = snapshot.readTime;
            snapshot.forEach((result) => { });
            snapshot.forEach((result) => { }, {});
            const equals = snapshot.isEqual(snapshot);
        });
    });
    it('has typings for DocumentChange', () => {
        collRef.get().then((snapshot) => {
            const docChange = snapshot.docChanges()[0];
            const doc = docChange.doc;
            const oldIndex = docChange.oldIndex;
            const newIndex = docChange.newIndex;
            const equals = docChange.isEqual(docChange);
        });
    });
    it('has typings for CollectionReference', () => {
        const firestore = collRef.firestore;
        const parent = collRef.parent;
        const path = collRef.path;
        const id = collRef.id;
        const docRef1 = collRef.doc();
        const docRef2 = collRef.doc('doc');
        collRef.add(documentData).then((docRef) => { });
        collRef.withConverter(defaultConverter);
        const list = collRef.listDocuments();
        const equals = collRef.isEqual(collRef);
    });
    it('has typings for FieldValue', () => {
        const documentData = {
            a: FieldValue.serverTimestamp(),
            b: FieldValue.delete(),
            c: FieldValue.arrayUnion('foo'),
            d: FieldValue.arrayRemove('bar'),
            e: FieldValue.increment(0),
        };
        const serverTimestamp = FieldValue.serverTimestamp();
        const deleteField = FieldValue.delete();
        const arrayUnion = FieldValue.arrayUnion('foo', 'bar');
        const arrayRemove = FieldValue.arrayRemove('foo', 'bar');
        const equals = FieldValue.serverTimestamp().isEqual(FieldValue.serverTimestamp());
    });
    it('has typings for SetOptions', () => {
        const merge = { merge: true };
        const mergeFields = { mergeFields: ['foo', fieldPath] };
    });
    it('has typings for Timestamp', () => {
        let timestamp = new Timestamp(0, 0);
        timestamp = Timestamp.now();
        timestamp = Timestamp.fromDate(new Date());
        timestamp = Timestamp.fromMillis(0);
        const seconds = timestamp.seconds;
        const nanoseconds = timestamp.nanoseconds;
    });
});
//# sourceMappingURL=typescript.js.map