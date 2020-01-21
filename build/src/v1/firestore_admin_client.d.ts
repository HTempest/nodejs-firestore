/// <reference types="node" />
import * as gax from 'google-gax';
import { Callback, ClientOptions, LROperation } from 'google-gax';
import { Transform } from 'stream';
import * as protosTypes from '../../protos/firestore_admin_v1_proto_api';
/**
 *  Operations are created by service `FirestoreAdmin`, but are accessed via
 *  service `google.longrunning.Operations`.
 * @class
 * @memberof v1
 */
export declare class FirestoreAdminClient {
    private _descriptors;
    private _innerApiCalls;
    private _pathTemplates;
    private _terminated;
    auth: gax.GoogleAuth;
    operationsClient: gax.OperationsClient;
    firestoreAdminStub: Promise<{
        [name: string]: Function;
    }>;
    /**
     * Construct an instance of FirestoreAdminClient.
     *
     * @param {object} [options] - The configuration object. See the subsequent
     *   parameters for more details.
     * @param {object} [options.credentials] - Credentials object.
     * @param {string} [options.credentials.client_email]
     * @param {string} [options.credentials.private_key]
     * @param {string} [options.email] - Account email address. Required when
     *     using a .pem or .p12 keyFilename.
     * @param {string} [options.keyFilename] - Full path to the a .json, .pem, or
     *     .p12 key downloaded from the Google Developers Console. If you provide
     *     a path to a JSON file, the projectId option below is not necessary.
     *     NOTE: .pem and .p12 require you to specify options.email as well.
     * @param {number} [options.port] - The port on which to connect to
     *     the remote host.
     * @param {string} [options.projectId] - The project ID from the Google
     *     Developer's Console, e.g. 'grape-spaceship-123'. We will also check
     *     the environment variable GCLOUD_PROJECT for your project ID. If your
     *     app is running in an environment which supports
     *     {@link https://developers.google.com/identity/protocols/application-default-credentials Application Default Credentials},
     *     your project ID will be detected automatically.
     * @param {function} [options.promise] - Custom promise module to use instead
     *     of native Promises.
     * @param {string} [options.apiEndpoint] - The domain name of the
     *     API remote host.
     */
    constructor(opts?: ClientOptions);
    /**
     * The DNS address for this API service.
     */
    static readonly servicePath: string;
    /**
     * The DNS address for this API service - same as servicePath(),
     * exists for compatibility reasons.
     */
    static readonly apiEndpoint: string;
    /**
     * The port for this API service.
     */
    static readonly port: number;
    /**
     * The scopes needed to make gRPC calls for every method defined
     * in this service.
     */
    static readonly scopes: string[];
    getProjectId(): Promise<string>;
    getProjectId(callback: Callback<string, undefined, undefined>): void;
    getIndex(request: protosTypes.google.firestore.admin.v1.IGetIndexRequest, options?: gax.CallOptions): Promise<[protosTypes.google.firestore.admin.v1.IIndex, protosTypes.google.firestore.admin.v1.IGetIndexRequest | undefined, {} | undefined]>;
    getIndex(request: protosTypes.google.firestore.admin.v1.IGetIndexRequest, options: gax.CallOptions, callback: Callback<protosTypes.google.firestore.admin.v1.IIndex, protosTypes.google.firestore.admin.v1.IGetIndexRequest | undefined, {} | undefined>): void;
    deleteIndex(request: protosTypes.google.firestore.admin.v1.IDeleteIndexRequest, options?: gax.CallOptions): Promise<[protosTypes.google.protobuf.IEmpty, protosTypes.google.firestore.admin.v1.IDeleteIndexRequest | undefined, {} | undefined]>;
    deleteIndex(request: protosTypes.google.firestore.admin.v1.IDeleteIndexRequest, options: gax.CallOptions, callback: Callback<protosTypes.google.protobuf.IEmpty, protosTypes.google.firestore.admin.v1.IDeleteIndexRequest | undefined, {} | undefined>): void;
    getField(request: protosTypes.google.firestore.admin.v1.IGetFieldRequest, options?: gax.CallOptions): Promise<[protosTypes.google.firestore.admin.v1.IField, protosTypes.google.firestore.admin.v1.IGetFieldRequest | undefined, {} | undefined]>;
    getField(request: protosTypes.google.firestore.admin.v1.IGetFieldRequest, options: gax.CallOptions, callback: Callback<protosTypes.google.firestore.admin.v1.IField, protosTypes.google.firestore.admin.v1.IGetFieldRequest | undefined, {} | undefined>): void;
    createIndex(request: protosTypes.google.firestore.admin.v1.ICreateIndexRequest, options?: gax.CallOptions): Promise<[LROperation<protosTypes.google.firestore.admin.v1.IIndex, protosTypes.google.firestore.admin.v1.IIndexOperationMetadata>, protosTypes.google.longrunning.IOperation | undefined, {} | undefined]>;
    createIndex(request: protosTypes.google.firestore.admin.v1.ICreateIndexRequest, options: gax.CallOptions, callback: Callback<LROperation<protosTypes.google.firestore.admin.v1.IIndex, protosTypes.google.firestore.admin.v1.IIndexOperationMetadata>, protosTypes.google.longrunning.IOperation | undefined, {} | undefined>): void;
    updateField(request: protosTypes.google.firestore.admin.v1.IUpdateFieldRequest, options?: gax.CallOptions): Promise<[LROperation<protosTypes.google.firestore.admin.v1.IField, protosTypes.google.firestore.admin.v1.IFieldOperationMetadata>, protosTypes.google.longrunning.IOperation | undefined, {} | undefined]>;
    updateField(request: protosTypes.google.firestore.admin.v1.IUpdateFieldRequest, options: gax.CallOptions, callback: Callback<LROperation<protosTypes.google.firestore.admin.v1.IField, protosTypes.google.firestore.admin.v1.IFieldOperationMetadata>, protosTypes.google.longrunning.IOperation | undefined, {} | undefined>): void;
    exportDocuments(request: protosTypes.google.firestore.admin.v1.IExportDocumentsRequest, options?: gax.CallOptions): Promise<[LROperation<protosTypes.google.firestore.admin.v1.IExportDocumentsResponse, protosTypes.google.firestore.admin.v1.IExportDocumentsMetadata>, protosTypes.google.longrunning.IOperation | undefined, {} | undefined]>;
    exportDocuments(request: protosTypes.google.firestore.admin.v1.IExportDocumentsRequest, options: gax.CallOptions, callback: Callback<LROperation<protosTypes.google.firestore.admin.v1.IExportDocumentsResponse, protosTypes.google.firestore.admin.v1.IExportDocumentsMetadata>, protosTypes.google.longrunning.IOperation | undefined, {} | undefined>): void;
    importDocuments(request: protosTypes.google.firestore.admin.v1.IImportDocumentsRequest, options?: gax.CallOptions): Promise<[LROperation<protosTypes.google.protobuf.IEmpty, protosTypes.google.firestore.admin.v1.IImportDocumentsMetadata>, protosTypes.google.longrunning.IOperation | undefined, {} | undefined]>;
    importDocuments(request: protosTypes.google.firestore.admin.v1.IImportDocumentsRequest, options: gax.CallOptions, callback: Callback<LROperation<protosTypes.google.protobuf.IEmpty, protosTypes.google.firestore.admin.v1.IImportDocumentsMetadata>, protosTypes.google.longrunning.IOperation | undefined, {} | undefined>): void;
    listIndexes(request: protosTypes.google.firestore.admin.v1.IListIndexesRequest, options?: gax.CallOptions): Promise<[protosTypes.google.firestore.admin.v1.IIndex[], protosTypes.google.firestore.admin.v1.IListIndexesRequest | null, protosTypes.google.firestore.admin.v1.IListIndexesResponse]>;
    listIndexes(request: protosTypes.google.firestore.admin.v1.IListIndexesRequest, options: gax.CallOptions, callback: Callback<protosTypes.google.firestore.admin.v1.IIndex[], protosTypes.google.firestore.admin.v1.IListIndexesRequest | null, protosTypes.google.firestore.admin.v1.IListIndexesResponse>): void;
    /**
     * Equivalent to {@link listIndexes}, but returns a NodeJS Stream object.
     *
     * This fetches the paged responses for {@link listIndexes} continuously
     * and invokes the callback registered for 'data' event for each element in the
     * responses.
     *
     * The returned object has 'end' method when no more elements are required.
     *
     * autoPaginate option will be ignored.
     *
     * @see {@link https://nodejs.org/api/stream.html}
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.parent
     *   Required. A parent name of the form
     *   `projects/{project_id}/databases/{database_id}/collectionGroups/{collection_id}`
     * @param {string} request.filter
     *   The filter to apply to list results.
     * @param {number} request.pageSize
     *   The number of results to return.
     * @param {string} request.pageToken
     *   A page token, returned from a previous call to
     *   [FirestoreAdmin.ListIndexes][google.firestore.admin.v1.FirestoreAdmin.ListIndexes], that may be used to get the next
     *   page of results.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Stream}
     *   An object stream which emits an object representing [Index]{@link google.firestore.admin.v1.Index} on 'data' event.
     */
    listIndexesStream(request?: protosTypes.google.firestore.admin.v1.IListIndexesRequest, options?: gax.CallOptions | {}): Transform;
    listFields(request: protosTypes.google.firestore.admin.v1.IListFieldsRequest, options?: gax.CallOptions): Promise<[protosTypes.google.firestore.admin.v1.IField[], protosTypes.google.firestore.admin.v1.IListFieldsRequest | null, protosTypes.google.firestore.admin.v1.IListFieldsResponse]>;
    listFields(request: protosTypes.google.firestore.admin.v1.IListFieldsRequest, options: gax.CallOptions, callback: Callback<protosTypes.google.firestore.admin.v1.IField[], protosTypes.google.firestore.admin.v1.IListFieldsRequest | null, protosTypes.google.firestore.admin.v1.IListFieldsResponse>): void;
    /**
     * Equivalent to {@link listFields}, but returns a NodeJS Stream object.
     *
     * This fetches the paged responses for {@link listFields} continuously
     * and invokes the callback registered for 'data' event for each element in the
     * responses.
     *
     * The returned object has 'end' method when no more elements are required.
     *
     * autoPaginate option will be ignored.
     *
     * @see {@link https://nodejs.org/api/stream.html}
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.parent
     *   Required. A parent name of the form
     *   `projects/{project_id}/databases/{database_id}/collectionGroups/{collection_id}`
     * @param {string} request.filter
     *   The filter to apply to list results. Currently,
     *   [FirestoreAdmin.ListFields][google.firestore.admin.v1.FirestoreAdmin.ListFields] only supports listing fields
     *   that have been explicitly overridden. To issue this query, call
     *   [FirestoreAdmin.ListFields][google.firestore.admin.v1.FirestoreAdmin.ListFields] with the filter set to
     *   `indexConfig.usesAncestorConfig:false`.
     * @param {number} request.pageSize
     *   The number of results to return.
     * @param {string} request.pageToken
     *   A page token, returned from a previous call to
     *   [FirestoreAdmin.ListFields][google.firestore.admin.v1.FirestoreAdmin.ListFields], that may be used to get the next
     *   page of results.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Stream}
     *   An object stream which emits an object representing [Field]{@link google.firestore.admin.v1.Field} on 'data' event.
     */
    listFieldsStream(request?: protosTypes.google.firestore.admin.v1.IListFieldsRequest, options?: gax.CallOptions | {}): Transform;
    /**
     * Return a fully-qualified collectiongroup resource name string.
     *
     * @param {string} project
     * @param {string} database
     * @param {string} collection
     * @returns {string} Resource name string.
     */
    collectionGroupPath(project: string, database: string, collection: string): string;
    /**
     * Parse the project from CollectionGroup resource.
     *
     * @param {string} collectiongroupName
     *   A fully-qualified path representing CollectionGroup resource.
     * @returns {string} A string representing the project.
     */
    matchProjectFromCollectionGroupName(collectiongroupName: string): string;
    /**
     * Parse the database from CollectionGroup resource.
     *
     * @param {string} collectiongroupName
     *   A fully-qualified path representing CollectionGroup resource.
     * @returns {string} A string representing the database.
     */
    matchDatabaseFromCollectionGroupName(collectiongroupName: string): string;
    /**
     * Parse the collection from CollectionGroup resource.
     *
     * @param {string} collectiongroupName
     *   A fully-qualified path representing CollectionGroup resource.
     * @returns {string} A string representing the collection.
     */
    matchCollectionFromCollectionGroupName(collectiongroupName: string): string;
    /**
     * Return a fully-qualified index resource name string.
     *
     * @param {string} project
     * @param {string} database
     * @param {string} collection
     * @param {string} index
     * @returns {string} Resource name string.
     */
    indexPath(project: string, database: string, collection: string, index: string): string;
    /**
     * Parse the project from Index resource.
     *
     * @param {string} indexName
     *   A fully-qualified path representing Index resource.
     * @returns {string} A string representing the project.
     */
    matchProjectFromIndexName(indexName: string): string;
    /**
     * Parse the database from Index resource.
     *
     * @param {string} indexName
     *   A fully-qualified path representing Index resource.
     * @returns {string} A string representing the database.
     */
    matchDatabaseFromIndexName(indexName: string): string;
    /**
     * Parse the collection from Index resource.
     *
     * @param {string} indexName
     *   A fully-qualified path representing Index resource.
     * @returns {string} A string representing the collection.
     */
    matchCollectionFromIndexName(indexName: string): string;
    /**
     * Parse the index from Index resource.
     *
     * @param {string} indexName
     *   A fully-qualified path representing Index resource.
     * @returns {string} A string representing the index.
     */
    matchIndexFromIndexName(indexName: string): string;
    /**
     * Return a fully-qualified field resource name string.
     *
     * @param {string} project
     * @param {string} database
     * @param {string} collection
     * @param {string} field
     * @returns {string} Resource name string.
     */
    fieldPath(project: string, database: string, collection: string, field: string): string;
    /**
     * Parse the project from Field resource.
     *
     * @param {string} fieldName
     *   A fully-qualified path representing Field resource.
     * @returns {string} A string representing the project.
     */
    matchProjectFromFieldName(fieldName: string): string;
    /**
     * Parse the database from Field resource.
     *
     * @param {string} fieldName
     *   A fully-qualified path representing Field resource.
     * @returns {string} A string representing the database.
     */
    matchDatabaseFromFieldName(fieldName: string): string;
    /**
     * Parse the collection from Field resource.
     *
     * @param {string} fieldName
     *   A fully-qualified path representing Field resource.
     * @returns {string} A string representing the collection.
     */
    matchCollectionFromFieldName(fieldName: string): string;
    /**
     * Parse the field from Field resource.
     *
     * @param {string} fieldName
     *   A fully-qualified path representing Field resource.
     * @returns {string} A string representing the field.
     */
    matchFieldFromFieldName(fieldName: string): string;
    /**
     * Return a fully-qualified database resource name string.
     *
     * @param {string} project
     * @param {string} database
     * @returns {string} Resource name string.
     */
    databasePath(project: string, database: string): string;
    /**
     * Parse the project from Database resource.
     *
     * @param {string} databaseName
     *   A fully-qualified path representing Database resource.
     * @returns {string} A string representing the project.
     */
    matchProjectFromDatabaseName(databaseName: string): string;
    /**
     * Parse the database from Database resource.
     *
     * @param {string} databaseName
     *   A fully-qualified path representing Database resource.
     * @returns {string} A string representing the database.
     */
    matchDatabaseFromDatabaseName(databaseName: string): string;
    /**
     * Terminate the GRPC channel and close the client.
     *
     * The client will no longer be usable and all future behavior is undefined.
     */
    close(): Promise<void>;
}
