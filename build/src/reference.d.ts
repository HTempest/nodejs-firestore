/*!
 * Copyright 2017 Google Inc. All Rights Reserved.
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
/// <reference types="node" />
import * as proto from '../protos/firestore_v1_proto_api';
import { DocumentSnapshot, QueryDocumentSnapshot } from './document';
import { DocumentChange } from './document-change';
import { Firestore } from './index';
import { FieldPath, ResourcePath } from './path';
import { Serializable, Serializer } from './serializer';
import { Timestamp } from './timestamp';
import { DocumentData, FirestoreDataConverter, OrderByDirection, Precondition, SetOptions, UpdateData, WhereFilterOp } from './types';
import { WriteResult } from './write-batch';
import api = proto.google.firestore.v1;
/**
 * onSnapshot() callback that receives a QuerySnapshot.
 *
 * @callback querySnapshotCallback
 * @param {QuerySnapshot} snapshot A query snapshot.
 */
/**
 * onSnapshot() callback that receives a DocumentSnapshot.
 *
 * @callback documentSnapshotCallback
 * @param {DocumentSnapshot} snapshot A document snapshot.
 */
/**
 * onSnapshot() callback that receives an error.
 *
 * @callback errorCallback
 * @param {Error} err An error from a listen.
 */
/**
 * A DocumentReference refers to a document location in a Firestore database
 * and can be used to write, read, or listen to the location. The document at
 * the referenced location may or may not exist. A DocumentReference can
 * also be used to create a
 * [CollectionReference]{@link CollectionReference} to a
 * subcollection.
 *
 * @class
 */
export declare class DocumentReference<T = DocumentData> implements Serializable {
    private readonly _firestore;
    readonly _path: ResourcePath;
    readonly _converter: FirestoreDataConverter<T>;
    /**
     * @hideconstructor
     *
     * @param _firestore The Firestore Database client.
     * @param _path The Path of this reference.
     */
    constructor(_firestore: Firestore, _path: ResourcePath, _converter?: FirestoreDataConverter<T>);
    /**
     * The string representation of the DocumentReference's location.
     * @private
     * @type {string}
     * @name DocumentReference#formattedName
     */
    readonly formattedName: string;
    /**
     * The [Firestore]{@link Firestore} instance for the Firestore
     * database (useful for performing transactions, etc.).
     *
     * @type {Firestore}
     * @name DocumentReference#firestore
     * @readonly
     *
     * @example
     * let collectionRef = firestore.collection('col');
     *
     * collectionRef.add({foo: 'bar'}).then(documentReference => {
     *   let firestore = documentReference.firestore;
     *   console.log(`Root location for document is ${firestore.formattedName}`);
     * });
     */
    readonly firestore: Firestore;
    /**
     * A string representing the path of the referenced document (relative
     * to the root of the database).
     *
     * @type {string}
     * @name DocumentReference#path
     * @readonly
     *
     * @example
     * let collectionRef = firestore.collection('col');
     *
     * collectionRef.add({foo: 'bar'}).then(documentReference => {
     *   console.log(`Added document at '${documentReference.path}'`);
     * });
     */
    readonly path: string;
    /**
     * The last path element of the referenced document.
     *
     * @type {string}
     * @name DocumentReference#id
     * @readonly
     *
     * @example
     * let collectionRef = firestore.collection('col');
     *
     * collectionRef.add({foo: 'bar'}).then(documentReference => {
     *   console.log(`Added document with name '${documentReference.id}'`);
     * });
     */
    readonly id: string;
    /**
     * A reference to the collection to which this DocumentReference belongs.
     *
     * @name DocumentReference#parent
     * @type {CollectionReference}
     * @readonly
     *
     * @example
     * let documentRef = firestore.doc('col/doc');
     * let collectionRef = documentRef.parent;
     *
     * collectionRef.where('foo', '==', 'bar').get().then(results => {
     *   console.log(`Found ${results.size} matches in parent collection`);
     * }):
     */
    readonly parent: CollectionReference<T>;
    /**
     * Reads the document referred to by this DocumentReference.
     *
     * @returns {Promise.<DocumentSnapshot>} A Promise resolved with a
     * DocumentSnapshot for the retrieved document on success. For missing
     * documents, DocumentSnapshot.exists will be false. If the get() fails for
     * other reasons, the Promise will be rejected.
     *
     * @example
     * let documentRef = firestore.doc('col/doc');
     *
     * documentRef.get().then(documentSnapshot => {
     *   if (documentSnapshot.exists) {
     *     console.log('Document retrieved successfully.');
     *   }
     * });
     */
    get(): Promise<DocumentSnapshot<T>>;
    /**
     * Gets a [CollectionReference]{@link CollectionReference} instance
     * that refers to the collection at the specified path.
     *
     * @param {string} collectionPath A slash-separated path to a collection.
     * @returns {CollectionReference} A reference to the new
     * subcollection.
     *
     * @example
     * let documentRef = firestore.doc('col/doc');
     * let subcollection = documentRef.collection('subcollection');
     * console.log(`Path to subcollection: ${subcollection.path}`);
     */
    collection(collectionPath: string): CollectionReference;
    /**
     * Fetches the subcollections that are direct children of this document.
     *
     * @returns {Promise.<Array.<CollectionReference>>} A Promise that resolves
     * with an array of CollectionReferences.
     *
     * @example
     * let documentRef = firestore.doc('col/doc');
     *
     * documentRef.listCollections().then(collections => {
     *   for (let collection of collections) {
     *     console.log(`Found subcollection with id: ${collection.id}`);
     *   }
     * });
     */
    listCollections(): Promise<Array<CollectionReference<DocumentData>>>;
    /**
     * Create a document with the provided object values. This will fail the write
     * if a document exists at its location.
     *
     * @param {DocumentData} data An object that contains the fields and data to
     * serialize as the document.
     * @returns {Promise.<WriteResult>} A Promise that resolves with the
     * write time of this create.
     *
     * @example
     * let documentRef = firestore.collection('col').doc();
     *
     * documentRef.create({foo: 'bar'}).then((res) => {
     *   console.log(`Document created at ${res.updateTime}`);
     * }).catch((err) => {
     *   console.log(`Failed to create document: ${err}`);
     * });
     */
    create(data: T): Promise<WriteResult>;
    /**
     * Deletes the document referred to by this `DocumentReference`.
     *
     * A delete for a non-existing document is treated as a success (unless
     * lastUptimeTime is provided).
     *
     * @param {Precondition=} precondition A precondition to enforce for this
     * delete.
     * @param {Timestamp=} precondition.lastUpdateTime If set, enforces that the
     * document was last updated at lastUpdateTime. Fails the delete if the
     * document was last updated at a different time.
     * @returns {Promise.<WriteResult>} A Promise that resolves with the
     * delete time.
     *
     * @example
     * let documentRef = firestore.doc('col/doc');
     *
     * documentRef.delete().then(() => {
     *   console.log('Document successfully deleted.');
     * });
     */
    delete(precondition?: Precondition): Promise<WriteResult>;
    /**
     * Writes to the document referred to by this DocumentReference. If the
     * document does not yet exist, it will be created. If you pass
     * [SetOptions]{@link SetOptions}, the provided data can be merged into an
     * existing document.
     *
     * @param {T} data A map of the fields and values for the document.
     * @param {SetOptions=} options An object to configure the set behavior.
     * @param {boolean=} options.merge If true, set() merges the values specified
     * in its data argument. Fields omitted from this set() call remain untouched.
     * @param {Array.<string|FieldPath>=} options.mergeFields If provided,
     * set() only replaces the specified field paths. Any field path that is not
     * specified is ignored and remains untouched.
     * @returns {Promise.<WriteResult>} A Promise that resolves with the
     * write time of this set.
     *
     * @example
     * let documentRef = firestore.doc('col/doc');
     *
     * documentRef.set({foo: 'bar'}).then(res => {
     *   console.log(`Document written at ${res.updateTime}`);
     * });
     */
    set(data: T, options?: SetOptions): Promise<WriteResult>;
    /**
     * Updates fields in the document referred to by this DocumentReference.
     * If the document doesn't yet exist, the update fails and the returned
     * Promise will be rejected.
     *
     * The update() method accepts either an object with field paths encoded as
     * keys and field values encoded as values, or a variable number of arguments
     * that alternate between field paths and field values.
     *
     * A Precondition restricting this update can be specified as the last
     * argument.
     *
     * @param {UpdateData|string|FieldPath} dataOrField An object containing the
     * fields and values with which to update the document or the path of the
     * first field to update.
     * @param {
     * ...(*|string|FieldPath|Precondition)} preconditionOrValues An alternating
     * list of field paths and values to update or a Precondition to restrict
     * this update.
     * @returns {Promise.<WriteResult>} A Promise that resolves once the
     * data has been successfully written to the backend.
     *
     * @example
     * let documentRef = firestore.doc('col/doc');
     *
     * documentRef.update({foo: 'bar'}).then(res => {
     *   console.log(`Document updated at ${res.updateTime}`);
     * });
     */
    update(dataOrField: UpdateData | string | FieldPath, ...preconditionOrValues: Array<unknown | string | FieldPath | Precondition>): Promise<WriteResult>;
    /**
     * Attaches a listener for DocumentSnapshot events.
     *
     * @param {documentSnapshotCallback} onNext A callback to be called every
     * time a new `DocumentSnapshot` is available.
     * @param {errorCallback=} onError A callback to be called if the listen fails
     * or is cancelled. No further callbacks will occur. If unset, errors will be
     * logged to the console.
     *
     * @returns {function()} An unsubscribe function that can be called to cancel
     * the snapshot listener.
     *
     * @example
     * let documentRef = firestore.doc('col/doc');
     *
     * let unsubscribe = documentRef.onSnapshot(documentSnapshot => {
     *   if (documentSnapshot.exists) {
     *     console.log(documentSnapshot.data());
     *   }
     * }, err => {
     *   console.log(`Encountered error: ${err}`);
     * });
     *
     * // Remove this listener.
     * unsubscribe();
     */
    onSnapshot(onNext: (snapshot: DocumentSnapshot<T>) => void, onError?: (error: Error) => void): () => void;
    /**
     * Returns true if this `DocumentReference` is equal to the provided value.
     *
     * @param {*} other The value to compare against.
     * @return {boolean} true if this `DocumentReference` is equal to the provided
     * value.
     */
    isEqual(other: DocumentReference<T>): boolean;
    /**
     * Converts this DocumentReference to the Firestore Proto representation.
     *
     * @private
     */
    toProto(): api.IValue;
    /**
     * Applies a custom data converter to this DocumentReference, allowing you
     * to use your own custom model objects with Firestore. When you call
     * set(), get(), etc. on the returned DocumentReference instance, the
     * provided converter will convert between Firestore data and your custom
     * type U.
     *
     * Using the converter allows you to specify generic type arguments when
     * storing and retrieving objects from Firestore.
     *
     * @example
     * class Post {
     *   constructor(readonly title: string, readonly author: string) {}
     *
     *   toString(): string {
     *     return this.title + ', by ' + this.author;
     *   }
     * }
     *
     * const postConverter = {
     *   toFirestore(post: Post): FirebaseFirestore.DocumentData {
     *     return {title: post.title, author: post.author};
     *   },
     *   fromFirestore(
     *     data: FirebaseFirestore.DocumentData
     *   ): Post {
     *     return new Post(data.title, data.author);
     *   }
     * };
     *
     * const postSnap = await Firestore()
     *   .collection('posts')
     *   .withConverter(postConverter)
     *   .doc().get();
     * const post = postSnap.data();
     * if (post !== undefined) {
     *   post.title; // string
     *   post.toString(); // Should be defined
     *   post.someNonExistentProperty; // TS error
     * }
     *
     * @param converter Converts objects to and from Firestore.
     * @return A DocumentReference<U> that uses the provided converter.
     */
    withConverter<U>(converter: FirestoreDataConverter<U>): DocumentReference<U>;
}
/**
 * A Query order-by field.
 *
 * @private
 * @class
 */
declare class FieldOrder {
    readonly field: FieldPath;
    readonly direction: api.StructuredQuery.Direction;
    /**
     * @param field The name of a document field (member) on which to order query
     * results.
     * @param direction One of 'ASCENDING' (default) or 'DESCENDING' to
     * set the ordering direction to ascending or descending, respectively.
     */
    constructor(field: FieldPath, direction?: api.StructuredQuery.Direction);
    /**
     * Generates the proto representation for this field order.
     * @private
     */
    toProto(): api.StructuredQuery.IOrder;
}
/**
 * A field constraint for a Query where clause.
 *
 * @private
 * @class
 */
declare class FieldFilter {
    private readonly serializer;
    readonly field: FieldPath;
    private readonly op;
    private readonly value;
    /**
     * @param serializer The Firestore serializer
     * @param field The path of the property value to compare.
     * @param op A comparison operation.
     * @param value The value to which to compare the field for inclusion in a
     * query.
     */
    constructor(serializer: Serializer, field: FieldPath, op: api.StructuredQuery.FieldFilter.Operator, value: unknown);
    /**
     * Returns whether this FieldFilter uses an equals comparison.
     *
     * @private
     */
    isInequalityFilter(): boolean;
    /**
     * Generates the proto representation for this field filter.
     *
     * @private
     */
    toProto(): api.StructuredQuery.IFilter;
}
/**
 * A QuerySnapshot contains zero or more
 * [QueryDocumentSnapshot]{@link QueryDocumentSnapshot} objects
 * representing the results of a query. The documents can be accessed as an
 * array via the [documents]{@link QuerySnapshot#documents} property
 * or enumerated using the [forEach]{@link QuerySnapshot#forEach}
 * method. The number of documents can be determined via the
 * [empty]{@link QuerySnapshot#empty} and
 * [size]{@link QuerySnapshot#size} properties.
 *
 * @class QuerySnapshot
 */
export declare class QuerySnapshot<T = DocumentData> {
    private readonly _query;
    private readonly _readTime;
    private readonly _size;
    private _materializedDocs;
    private _materializedChanges;
    private _docs;
    private _changes;
    /**
     * @hideconstructor
     *
     * @param _query The originating query.
     * @param _readTime The time when this query snapshot was obtained.
     * @param _size The number of documents in the result set.
     * @param docs A callback returning a sorted array of documents matching
     * this query
     * @param changes A callback returning a sorted array of document change
     * events for this snapshot.
     */
    constructor(_query: Query<T>, _readTime: Timestamp, _size: number, docs: () => Array<QueryDocumentSnapshot<T>>, changes: () => Array<DocumentChange<T>>);
    /**
     * The query on which you called get() or onSnapshot() in order to get this
     * QuerySnapshot.
     *
     * @type {Query}
     * @name QuerySnapshot#query
     * @readonly
     *
     * @example
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * query.limit(10).get().then(querySnapshot => {
     *   console.log(`Returned first batch of results`);
     *   let query = querySnapshot.query;
     *   return query.offset(10).get();
     * }).then(() => {
     *   console.log(`Returned second batch of results`);
     * });
     */
    readonly query: Query<T>;
    /**
     * An array of all the documents in this QuerySnapshot.
     *
     * @type {Array.<QueryDocumentSnapshot>}
     * @name QuerySnapshot#docs
     * @readonly
     *
     * @example
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * query.get().then(querySnapshot => {
     *   let docs = querySnapshot.docs;
     *   for (let doc of docs) {
     *     console.log(`Document found at path: ${doc.ref.path}`);
     *   }
     * });
     */
    readonly docs: Array<QueryDocumentSnapshot<T>>;
    /**
     * True if there are no documents in the QuerySnapshot.
     *
     * @type {boolean}
     * @name QuerySnapshot#empty
     * @readonly
     *
     * @example
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * query.get().then(querySnapshot => {
     *   if (querySnapshot.empty) {
     *     console.log('No documents found.');
     *   }
     * });
     */
    readonly empty: boolean;
    /**
     * The number of documents in the QuerySnapshot.
     *
     * @type {number}
     * @name QuerySnapshot#size
     * @readonly
     *
     * @example
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * query.get().then(querySnapshot => {
     *   console.log(`Found ${querySnapshot.size} documents.`);
     * });
     */
    readonly size: number;
    /**
     * The time this query snapshot was obtained.
     *
     * @type {Timestamp}
     * @name QuerySnapshot#readTime
     *
     * @example
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * query.get().then((querySnapshot) => {
     *   let readTime = querySnapshot.readTime;
     *   console.log(`Query results returned at '${readTime.toDate()}'`);
     * });
     */
    readonly readTime: Timestamp;
    /**
     * Returns an array of the documents changes since the last snapshot. If
     * this is the first snapshot, all documents will be in the list as added
     * changes.
     *
     * @return {Array.<DocumentChange>}
     *
     * @example
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * query.onSnapshot(querySnapshot => {
     *   let changes = querySnapshot.docChanges();
     *   for (let change of changes) {
     *     console.log(`A document was ${change.type}.`);
     *   }
     * });
     */
    docChanges(): Array<DocumentChange<T>>;
    /**
     * Enumerates all of the documents in the QuerySnapshot. This is a convenience
     * method for running the same callback on each {@link QueryDocumentSnapshot}
     * that is returned.
     *
     * @param {function} callback A callback to be called with a
     * [QueryDocumentSnapshot]{@link QueryDocumentSnapshot} for each document in
     * the snapshot.
     * @param {*=} thisArg The `this` binding for the callback..
     *
     * @example
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * query.get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Document found at path: ${documentSnapshot.ref.path}`);
     *   });
     * });
     */
    forEach(callback: (result: QueryDocumentSnapshot<T>) => void, thisArg?: unknown): void;
    /**
     * Returns true if the document data in this `QuerySnapshot` is equal to the
     * provided value.
     *
     * @param {*} other The value to compare against.
     * @return {boolean} true if this `QuerySnapshot` is equal to the provided
     * value.
     */
    isEqual(other: QuerySnapshot<T>): boolean;
}
/** Internal representation of a query cursor before serialization. */
interface QueryCursor {
    before?: boolean;
    values: unknown[];
}
/**
 * Internal class representing custom Query options.
 *
 * These options are immutable. Modified options can be created using `with()`.
 * @private
 */
export declare class QueryOptions<T> {
    readonly parentPath: ResourcePath;
    readonly collectionId: string;
    readonly converter: FirestoreDataConverter<T>;
    readonly allDescendants: boolean;
    readonly fieldFilters: FieldFilter[];
    readonly fieldOrders: FieldOrder[];
    readonly startAt?: QueryCursor | undefined;
    readonly endAt?: QueryCursor | undefined;
    readonly limit?: number | undefined;
    readonly offset?: number | undefined;
    readonly projection?: api.StructuredQuery.IProjection | undefined;
    constructor(parentPath: ResourcePath, collectionId: string, converter: FirestoreDataConverter<T>, allDescendants: boolean, fieldFilters: FieldFilter[], fieldOrders: FieldOrder[], startAt?: QueryCursor | undefined, endAt?: QueryCursor | undefined, limit?: number | undefined, offset?: number | undefined, projection?: api.StructuredQuery.IProjection | undefined);
    /**
     * Returns query options for a collection group query.
     * @private
     */
    static forCollectionGroupQuery<T>(collectionId: string, converter?: FirestoreDataConverter<T>): QueryOptions<T>;
    /**
     * Returns query options for a single-collection query.
     * @private
     */
    static forCollectionQuery<T>(collectionRef: ResourcePath, converter?: FirestoreDataConverter<T>): QueryOptions<T>;
    /**
     * Returns the union of the current and the provided options.
     * @private
     */
    with(settings: Partial<Omit<QueryOptions<T>, 'converter'>>, converter?: FirestoreDataConverter<T>): QueryOptions<T>;
    withConverter<U>(converter: FirestoreDataConverter<U>): QueryOptions<U>;
    isEqual(other: QueryOptions<T>): any;
}
/**
 * A Query refers to a query which you can read or stream from. You can also
 * construct refined Query objects by adding filters and ordering.
 *
 * @class Query
 */
export declare class Query<T = DocumentData> {
    private readonly _firestore;
    protected readonly _queryOptions: QueryOptions<T>;
    private readonly _serializer;
    /**
     * @hideconstructor
     *
     * @param _firestore The Firestore Database client.
     * @param _queryOptions Options that define the query.
     */
    constructor(_firestore: Firestore, _queryOptions: QueryOptions<T>);
    /**
     * Detects the argument type for Firestore cursors.
     *
     * @private
     * @param fieldValuesOrDocumentSnapshot A snapshot of the document or a set
     * of field values.
     * @returns 'true' if the input is a single DocumentSnapshot..
     */
    static _isDocumentSnapshot(fieldValuesOrDocumentSnapshot: Array<DocumentSnapshot<unknown> | unknown>): boolean;
    /**
     * Extracts field values from the DocumentSnapshot based on the provided
     * field order.
     *
     * @private
     * @param documentSnapshot The document to extract the fields from.
     * @param fieldOrders The field order that defines what fields we should
     * extract.
     * @return {Array.<*>} The field values to use.
     * @private
     */
    static _extractFieldValues(documentSnapshot: DocumentSnapshot, fieldOrders: FieldOrder[]): unknown[];
    /**
     * The [Firestore]{@link Firestore} instance for the Firestore
     * database (useful for performing transactions, etc.).
     *
     * @type {Firestore}
     * @name Query#firestore
     * @readonly
     *
     * @example
     * let collectionRef = firestore.collection('col');
     *
     * collectionRef.add({foo: 'bar'}).then(documentReference => {
     *   let firestore = documentReference.firestore;
     *   console.log(`Root location for document is ${firestore.formattedName}`);
     * });
     */
    readonly firestore: Firestore;
    /**
     * Creates and returns a new [Query]{@link Query} with the additional filter
     * that documents must contain the specified field and that its value should
     * satisfy the relation constraint provided.
     *
     * Returns a new Query that constrains the value of a Document property.
     *
     * This function returns a new (immutable) instance of the Query (rather than
     * modify the existing instance) to impose the filter.
     *
     * @param {string|FieldPath} fieldPath The name of a property value to compare.
     * @param {string} opStr A comparison operation in the form of a string
     * (e.g., "<").
     * @param {*} value The value to which to compare the field for inclusion in
     * a query.
     * @returns {Query} The created Query.
     *
     * @example
     * let collectionRef = firestore.collection('col');
     *
     * collectionRef.where('foo', '==', 'bar').get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     */
    where(fieldPath: string | FieldPath, opStr: WhereFilterOp, value: unknown): Query<T>;
    /**
     * Creates and returns a new [Query]{@link Query} instance that applies a
     * field mask to the result and returns only the specified subset of fields.
     * You can specify a list of field paths to return, or use an empty list to
     * only return the references of matching documents.
     *
     * This function returns a new (immutable) instance of the Query (rather than
     * modify the existing instance) to impose the field mask.
     *
     * @param {...(string|FieldPath)} fieldPaths The field paths to return.
     * @returns {Query} The created Query.
     *
     * @example
     * let collectionRef = firestore.collection('col');
     * let documentRef = collectionRef.doc('doc');
     *
     * return documentRef.set({x:10, y:5}).then(() => {
     *   return collectionRef.where('x', '>', 5).select('y').get();
     * }).then((res) => {
     *   console.log(`y is ${res.docs[0].get('y')}.`);
     * });
     */
    select(...fieldPaths: Array<string | FieldPath>): Query<T>;
    /**
     * Creates and returns a new [Query]{@link Query} that's additionally sorted
     * by the specified field, optionally in descending order instead of
     * ascending.
     *
     * This function returns a new (immutable) instance of the Query (rather than
     * modify the existing instance) to impose the field mask.
     *
     * @param {string|FieldPath} fieldPath The field to sort by.
     * @param {string=} directionStr Optional direction to sort by ('asc' or
     * 'desc'). If not specified, order will be ascending.
     * @returns {Query} The created Query.
     *
     * @example
     * let query = firestore.collection('col').where('foo', '>', 42);
     *
     * query.orderBy('foo', 'desc').get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     */
    orderBy(fieldPath: string | FieldPath, directionStr?: OrderByDirection): Query<T>;
    /**
     * Creates and returns a new [Query]{@link Query} that's additionally limited
     * to only return up to the specified number of documents.
     *
     * This function returns a new (immutable) instance of the Query (rather than
     * modify the existing instance) to impose the limit.
     *
     * @param {number} limit The maximum number of items to return.
     * @returns {Query} The created Query.
     *
     * @example
     * let query = firestore.collection('col').where('foo', '>', 42);
     *
     * query.limit(1).get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     */
    limit(limit: number): Query<T>;
    /**
     * Specifies the offset of the returned results.
     *
     * This function returns a new (immutable) instance of the
     * [Query]{@link Query} (rather than modify the existing instance)
     * to impose the offset.
     *
     * @param {number} offset The offset to apply to the Query results
     * @returns {Query} The created Query.
     *
     * @example
     * let query = firestore.collection('col').where('foo', '>', 42);
     *
     * query.limit(10).offset(20).get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     */
    offset(offset: number): Query<T>;
    /**
     * Returns true if this `Query` is equal to the provided value.
     *
     * @param {*} other The value to compare against.
     * @return {boolean} true if this `Query` is equal to the provided value.
     */
    isEqual(other: Query<T>): boolean;
    /**
     * Computes the backend ordering semantics for DocumentSnapshot cursors.
     *
     * @private
     * @param cursorValuesOrDocumentSnapshot The snapshot of the document or the
     * set of field values to use as the boundary.
     * @returns The implicit ordering semantics.
     */
    private createImplicitOrderBy;
    /**
     * Builds a Firestore 'Position' proto message.
     *
     * @private
     * @param {Array.<FieldOrder>} fieldOrders The field orders to use for this
     * cursor.
     * @param {Array.<DocumentSnapshot|*>} cursorValuesOrDocumentSnapshot The
     * snapshot of the document or the set of field values to use as the boundary.
     * @param before Whether the query boundary lies just before or after the
     * provided data.
     * @returns {Object} The proto message.
     */
    private createCursor;
    /**
     * Validates that a value used with FieldValue.documentId() is either a
     * string or a DocumentReference that is part of the query`s result set.
     * Throws a validation error or returns a DocumentReference that can
     * directly be used in the Query.
     *
     * @param val The value to validate.
     * @throws If the value cannot be used for this query.
     * @return If valid, returns a DocumentReference that can be used with the
     * query.
     * @private
     */
    private validateReference;
    /**
     * Creates and returns a new [Query]{@link Query} that starts at the provided
     * set of field values relative to the order of the query. The order of the
     * provided values must match the order of the order by clauses of the query.
     *
     * @param {...*|DocumentSnapshot} fieldValuesOrDocumentSnapshot The snapshot
     * of the document the query results should start at or the field values to
     * start this query at, in order of the query's order by.
     * @returns {Query} A query with the new starting point.
     *
     * @example
     * let query = firestore.collection('col');
     *
     * query.orderBy('foo').startAt(42).get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     */
    startAt(...fieldValuesOrDocumentSnapshot: Array<DocumentSnapshot<unknown> | unknown>): Query<T>;
    /**
     * Creates and returns a new [Query]{@link Query} that starts after the
     * provided set of field values relative to the order of the query. The order
     * of the provided values must match the order of the order by clauses of the
     * query.
     *
     * @param {...*|DocumentSnapshot} fieldValuesOrDocumentSnapshot The snapshot
     * of the document the query results should start after or the field values to
     * start this query after, in order of the query's order by.
     * @returns {Query} A query with the new starting point.
     *
     * @example
     * let query = firestore.collection('col');
     *
     * query.orderBy('foo').startAfter(42).get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     */
    startAfter(...fieldValuesOrDocumentSnapshot: Array<DocumentSnapshot<unknown> | unknown>): Query<T>;
    /**
     * Creates and returns a new [Query]{@link Query} that ends before the set of
     * field values relative to the order of the query. The order of the provided
     * values must match the order of the order by clauses of the query.
     *
     * @param {...*|DocumentSnapshot} fieldValuesOrDocumentSnapshot The snapshot
     * of the document the query results should end before or the field values to
     * end this query before, in order of the query's order by.
     * @returns {Query} A query with the new ending point.
     *
     * @example
     * let query = firestore.collection('col');
     *
     * query.orderBy('foo').endBefore(42).get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     */
    endBefore(...fieldValuesOrDocumentSnapshot: Array<DocumentSnapshot<unknown> | unknown>): Query<T>;
    /**
     * Creates and returns a new [Query]{@link Query} that ends at the provided
     * set of field values relative to the order of the query. The order of the
     * provided values must match the order of the order by clauses of the query.
     *
     * @param {...*|DocumentSnapshot} fieldValuesOrDocumentSnapshot The snapshot
     * of the document the query results should end at or the field values to end
     * this query at, in order of the query's order by.
     * @returns {Query} A query with the new ending point.
     *
     * @example
     * let query = firestore.collection('col');
     *
     * query.orderBy('foo').endAt(42).get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     */
    endAt(...fieldValuesOrDocumentSnapshot: Array<DocumentSnapshot<unknown> | unknown>): Query<T>;
    /**
     * Executes the query and returns the results as a
     * [QuerySnapshot]{@link QuerySnapshot}.
     *
     * @returns {Promise.<QuerySnapshot>} A Promise that resolves with the results
     * of the Query.
     *
     * @example
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * query.get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     */
    get(): Promise<QuerySnapshot<T>>;
    /**
     * Internal get() method that accepts an optional transaction id.
     *
     * @private
     * @param {bytes=} transactionId A transaction ID.
     */
    _get(transactionId?: Uint8Array): Promise<QuerySnapshot<T>>;
    /**
     * Executes the query and streams the results as
     * [QueryDocumentSnapshots]{@link QueryDocumentSnapshot}.
     *
     * @returns {Stream.<QueryDocumentSnapshot>} A stream of
     * QueryDocumentSnapshots.
     *
     * @example
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * let count = 0;
     *
     * query.stream().on('data', (documentSnapshot) => {
     *   console.log(`Found document with name '${documentSnapshot.id}'`);
     *   ++count;
     * }).on('end', () => {
     *   console.log(`Total count is ${count}`);
     * });
     */
    stream(): NodeJS.ReadableStream;
    /**
     * Converts a QueryCursor to its proto representation.
     * @private
     */
    private _toCursor;
    /**
     * Internal method for serializing a query to its RunQuery proto
     * representation with an optional transaction id.
     *
     * @param transactionId A transaction ID.
     * @private
     * @returns Serialized JSON for the query.
     */
    toProto(transactionId?: Uint8Array): api.IRunQueryRequest;
    /**
     * Internal streaming method that accepts an optional transaction id.
     *
     * @param transactionId A transaction ID.
     * @private
     * @returns A stream of document results.
     */
    _stream(transactionId?: Uint8Array): NodeJS.ReadableStream;
    /**
     * Attaches a listener for QuerySnapshot events.
     *
     * @param {querySnapshotCallback} onNext A callback to be called every time
     * a new [QuerySnapshot]{@link QuerySnapshot} is available.
     * @param {errorCallback=} onError A callback to be called if the listen
     * fails or is cancelled. No further callbacks will occur.
     *
     * @returns {function()} An unsubscribe function that can be called to cancel
     * the snapshot listener.
     *
     * @example
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * let unsubscribe = query.onSnapshot(querySnapshot => {
     *   console.log(`Received query snapshot of size ${querySnapshot.size}`);
     * }, err => {
     *   console.log(`Encountered error: ${err}`);
     * });
     *
     * // Remove this listener.
     * unsubscribe();
     */
    onSnapshot(onNext: (snapshot: QuerySnapshot<T>) => void, onError?: (error: Error) => void): () => void;
    /**
     * Returns a function that can be used to sort QueryDocumentSnapshots
     * according to the sort criteria of this query.
     *
     * @private
     */
    comparator(): (s1: QueryDocumentSnapshot<T>, s2: QueryDocumentSnapshot<T>) => number;
    /**
     * Applies a custom data converter to this Query, allowing you to use your
     * own custom model objects with Firestore. When you call get() on the
     * returned Query, the provided converter will convert between Firestore
     * data and your custom type U.
     *
     * Using the converter allows you to specify generic type arguments when
     * storing and retrieving objects from Firestore.
     *
     * @example
     * class Post {
     *   constructor(readonly title: string, readonly author: string) {}
     *
     *   toString(): string {
     *     return this.title + ', by ' + this.author;
     *   }
     * }
     *
     * const postConverter = {
     *   toFirestore(post: Post): FirebaseFirestore.DocumentData {
     *     return {title: post.title, author: post.author};
     *   },
     *   fromFirestore(
     *     data: FirebaseFirestore.DocumentData
     *   ): Post {
     *     return new Post(data.title, data.author);
     *   }
     * };
     *
     * const postSnap = await Firestore()
     *   .collection('posts')
     *   .withConverter(postConverter)
     *   .doc().get();
     * const post = postSnap.data();
     * if (post !== undefined) {
     *   post.title; // string
     *   post.toString(); // Should be defined
     *   post.someNonExistentProperty; // TS error
     * }
     *
     * @param converter Converts objects to and from Firestore.
     * @return A Query<U> that uses the provided converter.
     */
    withConverter<U>(converter: FirestoreDataConverter<U>): Query<U>;
}
/**
 * A CollectionReference object can be used for adding documents, getting
 * document references, and querying for documents (using the methods
 * inherited from [Query]{@link Query}).
 *
 * @class
 * @extends Query
 */
export declare class CollectionReference<T = DocumentData> extends Query<T> {
    /**
     * @hideconstructor
     *
     * @param firestore The Firestore Database client.
     * @param path The Path of this collection.
     */
    constructor(firestore: Firestore, path: ResourcePath, converter?: FirestoreDataConverter<T>);
    /**
     * Returns a resource path for this collection.
     * @private
     */
    private readonly resourcePath;
    /**
     * The last path element of the referenced collection.
     *
     * @type {string}
     * @name CollectionReference#id
     * @readonly
     *
     * @example
     * let collectionRef = firestore.collection('col/doc/subcollection');
     * console.log(`ID of the subcollection: ${collectionRef.id}`);
     */
    readonly id: string;
    /**
     * A reference to the containing Document if this is a subcollection, else
     * null.
     *
     * @type {DocumentReference}
     * @name CollectionReference#parent
     * @readonly
     *
     * @example
     * let collectionRef = firestore.collection('col/doc/subcollection');
     * let documentRef = collectionRef.parent;
     * console.log(`Parent name: ${documentRef.path}`);
     */
    readonly parent: DocumentReference<DocumentData>;
    /**
     * A string representing the path of the referenced collection (relative
     * to the root of the database).
     *
     * @type {string}
     * @name CollectionReference#path
     * @readonly
     *
     * @example
     * let collectionRef = firestore.collection('col/doc/subcollection');
     * console.log(`Path of the subcollection: ${collectionRef.path}`);
     */
    readonly path: string;
    /**
     * Retrieves the list of documents in this collection.
     *
     * The document references returned may include references to "missing
     * documents", i.e. document locations that have no document present but
     * which contain subcollections with documents. Attempting to read such a
     * document reference (e.g. via `.get()` or `.onSnapshot()`) will return a
     * `DocumentSnapshot` whose `.exists` property is false.
     *
     * @return {Promise<DocumentReference[]>} The list of documents in this
     * collection.
     *
     * @example
     * let collectionRef = firestore.collection('col');
     *
     * return collectionRef.listDocuments().then(documentRefs => {
     *    return firestore.getAll(documentRefs);
     * }).then(documentSnapshots => {
     *    for (let documentSnapshot of documentSnapshots) {
     *       if (documentSnapshot.exists) {
     *         console.log(`Found document with data: ${documentSnapshot.id}`);
     *       } else {
     *         console.log(`Found missing document: ${documentSnapshot.id}`);
     *       }
     *    }
     * });
     */
    listDocuments(): Promise<Array<DocumentReference<T>>>;
    doc(): DocumentReference<T>;
    doc(documentPath: string): DocumentReference<T>;
    /**
     * Add a new document to this collection with the specified data, assigning
     * it a document ID automatically.
     *
     * @param {DocumentData} data An Object containing the data for the new
     * document.
     * @returns {Promise.<DocumentReference>} A Promise resolved with a
     * [DocumentReference]{@link DocumentReference} pointing to the
     * newly created document.
     *
     * @example
     * let collectionRef = firestore.collection('col');
     * collectionRef.add({foo: 'bar'}).then(documentReference => {
     *   console.log(`Added document with name: ${documentReference.id}`);
     * });
     */
    add(data: T): Promise<DocumentReference<T>>;
    /**
     * Returns true if this `CollectionReference` is equal to the provided value.
     *
     * @param {*} other The value to compare against.
     * @return {boolean} true if this `CollectionReference` is equal to the
     * provided value.
     */
    isEqual(other: CollectionReference<T>): boolean;
    /**
     * Applies a custom data converter to this CollectionReference, allowing you
     * to use your own custom model objects with Firestore. When you call add()
     * on the returned CollectionReference instance, the provided converter will
     * convert between Firestore data and your custom type U.
     *
     * Using the converter allows you to specify generic type arguments when
     * storing and retrieving objects from Firestore.
     *
     * @example
     * class Post {
     *   constructor(readonly title: string, readonly author: string) {}
     *
     *   toString(): string {
     *     return this.title + ', by ' + this.author;
     *   }
     * }
     *
     * const postConverter = {
     *   toFirestore(post: Post): FirebaseFirestore.DocumentData {
     *     return {title: post.title, author: post.author};
     *   },
     *   fromFirestore(
     *     data: FirebaseFirestore.DocumentData
     *   ): Post {
     *     return new Post(data.title, data.author);
     *   }
     * };
     *
     * const postSnap = await Firestore()
     *   .collection('posts')
     *   .withConverter(postConverter)
     *   .doc().get();
     * const post = postSnap.data();
     * if (post !== undefined) {
     *   post.title; // string
     *   post.toString(); // Should be defined
     *   post.someNonExistentProperty; // TS error
     * }
     *
     * @param converter Converts objects to and from Firestore.
     * @return A CollectionReference<U> that uses the provided converter.
     */
    withConverter<U>(converter: FirestoreDataConverter<U>): CollectionReference<U>;
}
/**
 * Validates the input string as a field order direction.
 *
 * @private
 * @param arg The argument name or argument index (for varargs methods).
 * @param op Order direction to validate.
 * @throws when the direction is invalid
 * @return a validated input value, which may be different from the provided
 * value.
 */
export declare function validateQueryOrder(arg: string, op: unknown): OrderByDirection | undefined;
/**
 * Validates the input string as a field comparison operator.
 *
 * @private
 * @param arg The argument name or argument index (for varargs methods).
 * @param op Field comparison operator to validate.
 * @param fieldValue Value that is used in the filter.
 * @throws when the comparison operation is invalid
 * @return a validated input value, which may be different from the provided
 * value.
 */
export declare function validateQueryOperator(arg: string | number, op: unknown, fieldValue: unknown): WhereFilterOp;
/**
 * Validates that 'value' is a DocumentReference.
 *
 * @private
 * @param arg The argument name or argument index (for varargs methods).
 * @param value The argument to validate.
 */
export declare function validateDocumentReference(arg: string | number, value: unknown): void;
export {};
