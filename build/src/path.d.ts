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
import { google } from '../protos/firestore_v1_proto_api';
import api = google.firestore.v1;
/*!
 * The default database ID for this Firestore client. We do not yet expose the
 * ability to use different databases.
 */
export declare const DEFAULT_DATABASE_ID = "(default)";
/**
 * An abstract class representing a Firestore path.
 *
 * Subclasses have to implement `split()` and `canonicalString()`.
 *
 * @private
 * @class
 */
declare abstract class Path<T> {
    protected readonly segments: string[];
    /**
     * Creates a new Path with the given segments.
     *
     * @private
     * @hideconstructor
     * @param segments Sequence of parts of a path.
     */
    constructor(segments: string[]);
    /**
     * Returns the number of segments of this field path.
     *
     * @private
     */
    readonly size: number;
    abstract construct(segments: string[] | string): T;
    abstract split(relativePath: string): string[];
    /**
     * Create a child path beneath the current level.
     *
     * @private
     * @param relativePath Relative path to append to the current path.
     * @returns The new path.
     */
    append(relativePath: Path<T> | string): T;
    /**
     * Returns the path of the parent node.
     *
     * @private
     * @returns The new path or null if we are already at the root.
     */
    parent(): T | null;
    /**
     * Checks whether the current path is a prefix of the specified path.
     *
     * @private
     * @param other The path to check against.
     * @returns 'true' iff the current path is a prefix match with 'other'.
     */
    isPrefixOf(other: Path<T>): boolean;
    /**
     * Compare the current path against another Path object.
     *
     * @private
     * @param other The path to compare to.
     * @returns -1 if current < other, 1 if current > other, 0 if equal
     */
    compareTo(other: Path<T>): number;
    /**
     * Returns a copy of the underlying segments.
     *
     * @private
     * @returns A copy of the segments that make up this path.
     */
    toArray(): string[];
    /**
     * Returns true if this `Path` is equal to the provided value.
     *
     * @private
     * @param other The value to compare against.
     * @return true if this `Path` is equal to the provided value.
     */
    isEqual(other: Path<T>): boolean;
}
/**
 * A slash-separated path for navigating resources within the current Firestore
 * instance.
 *
 * @private
 */
export declare class ResourcePath extends Path<ResourcePath> {
    /**
     * A default instance pointing to the root collection.
     * @private
     */
    static EMPTY: ResourcePath;
    /**
     * Constructs a ResourcePath.
     *
     * @private
     * @param segments Sequence of names of the parts of the path.
     */
    constructor(...segments: string[]);
    /**
     * Indicates whether this path points to a document.
     * @private
     */
    readonly isDocument: boolean;
    /**
     * Indicates whether this path points to a collection.
     * @private
     */
    readonly isCollection: boolean;
    /**
     * The last component of the path.
     * @private
     */
    readonly id: string | null;
    /**
     * Returns the location of this path relative to the root of the project's
     * database.
     * @private
     */
    readonly relativeName: string;
    /**
     * Constructs a new instance of ResourcePath.
     *
     * @private
     * @param segments Sequence of parts of the path.
     * @returns The newly created ResourcePath.
     */
    construct(segments: string[]): ResourcePath;
    /**
     * Splits a string into path segments, using slashes as separators.
     *
     * @private
     * @param relativePath The path to split.
     * @returns The split path segments.
     */
    split(relativePath: string): string[];
    /**
     * Converts this path to a fully qualified ResourcePath.
     *
     * @private
     * @param projectIdIfMissing The project ID of the current Firestore project.
     * The project ID is only used if it's not provided as part of this
     * ResourcePath.
     * @return A fully-qualified resource path pointing to the same element.
     */
    toQualifiedResourcePath(projectIdIfMissing: string): QualifiedResourcePath;
}
/**
 * A slash-separated path that includes a project and database ID for referring
 * to resources in any Firestore project.
 *
 * @private
 */
export declare class QualifiedResourcePath extends ResourcePath {
    /**
     * The project ID of this path.
     */
    readonly projectId: string;
    /**
     * The database ID of this path.
     */
    readonly databaseId: string;
    /**
     * Constructs a Firestore Resource Path.
     *
     * @private
     * @param projectId The Firestore project id.
     * @param databaseId The Firestore database id.
     * @param segments Sequence of names of the parts of the path.
     */
    constructor(projectId: string, databaseId: string, ...segments: string[]);
    /**
     * String representation of the path relative to the database root.
     * @private
     */
    readonly relativeName: string;
    /**
     * Creates a resource path from an absolute Firestore path.
     *
     * @private
     * @param absolutePath A string representation of a Resource Path.
     * @returns The new ResourcePath.
     */
    static fromSlashSeparatedString(absolutePath: string): QualifiedResourcePath;
    /**
     * Create a child path beneath the current level.
     *
     * @private
     * @param relativePath Relative path to append to the current path.
     * @returns The new path.
     */
    append(relativePath: ResourcePath | string): QualifiedResourcePath;
    /**
     * Create a child path beneath the current level.
     *
     * @private
     * @returns The new path.
     */
    parent(): QualifiedResourcePath | null;
    /**
     * String representation of a ResourcePath as expected by the API.
     *
     * @private
     * @returns The representation as expected by the API.
     */
    readonly formattedName: string;
    /**
     * Constructs a new instance of ResourcePath. We need this instead of using
     * the normal constructor because polymorphic 'this' doesn't work on static
     * methods.
     *
     * @private
     * @param segments Sequence of names of the parts of the path.
     * @returns The newly created QualifiedResourcePath.
     */
    construct(segments: string[]): QualifiedResourcePath;
    /**
     * Convenience method to match the ResourcePath API. This method always
     * returns the current instance. The arguments is ignored.
     *
     * @param projectIdIfMissing The project ID of the current Firestore project.
     * The project ID is only used if it's not provided as part of this
     * ResourcePath.
     * @private
     */
    toQualifiedResourcePath(projectIdIfMissing: string): QualifiedResourcePath;
    /**
     * Compare the current path against another ResourcePath object.
     *
     * @private
     * @param other The path to compare to.
     * @returns -1 if current < other, 1 if current > other, 0 if equal
     */
    compareTo(other: ResourcePath): number;
    /**
     * Converts this ResourcePath to the Firestore Proto representation.
     * @private
     */
    toProto(): api.IValue;
}
/**
 * Validates that the given string can be used as a relative or absolute
 * resource path.
 *
 * @private
 * @param arg The argument name or argument index (for varargs methods).
 * @param resourcePath The path to validate.
 * @throws if the string can't be used as a resource path.
 */
export declare function validateResourcePath(arg: string | number, resourcePath: string): void;
/**
 * A dot-separated path for navigating sub-objects within a document.
 *
 * @class
 */
export declare class FieldPath extends Path<FieldPath> {
    /**
     * A special sentinel value to refer to the ID of a document.
     *
     * @private
     */
    private static _DOCUMENT_ID;
    /**
     * Constructs a Firestore Field Path.
     *
     * @param {...string} segments Sequence of field names that form this path.
     *
     * @example
     * let query = firestore.collection('col');
     * let fieldPath = new FieldPath('f.o.o', 'bar');
     *
     * query.where(fieldPath, '==', 42).get().then(snapshot => {
     *   snapshot.forEach(document => {
     *     console.log(`Document contains {'f.o.o' : {'bar' : 42}}`);
     *   });
     * });
     */
    constructor(...segments: string[]);
    /**
     * A special FieldPath value to refer to the ID of a document. It can be used
     * in queries to sort or filter by the document ID.
     *
     * @returns {FieldPath}
     */
    static documentId(): FieldPath;
    /**
     * Turns a field path argument into a [FieldPath]{@link FieldPath}.
     * Supports FieldPaths as input (which are passed through) and dot-separated
     * strings.
     *
     * @private
     * @param {string|FieldPath} fieldPath The FieldPath to create.
     * @returns {FieldPath} A field path representation.
     */
    static fromArgument(fieldPath: string | FieldPath): FieldPath;
    /**
     * String representation of a FieldPath as expected by the API.
     *
     * @private
     * @override
     * @returns {string} The representation as expected by the API.
     */
    readonly formattedName: string;
    /**
     * Returns a string representation of this path.
     *
     * @private
     * @returns A string representing this path.
     */
    toString(): string;
    /**
     * Splits a string into path segments, using dots as separators.
     *
     * @private
     * @override
     * @param {string} fieldPath The path to split.
     * @returns {Array.<string>} - The split path segments.
     */
    split(fieldPath: string): string[];
    /**
     * Constructs a new instance of FieldPath. We need this instead of using
     * the normal constructor because polymorphic 'this' doesn't work on static
     * methods.
     *
     * @private
     * @override
     * @param segments Sequence of field names.
     * @returns The newly created FieldPath.
     */
    construct(segments: string[]): FieldPath;
    /**
     * Returns true if this `FieldPath` is equal to the provided value.
     *
     * @param {*} other The value to compare against.
     * @return {boolean} true if this `FieldPath` is equal to the provided value.
     */
    isEqual(other: FieldPath): boolean;
}
/**
 * Validates that the provided value can be used as a field path argument.
 *
 * @private
 * @param arg The argument name or argument index (for varargs methods).
 * @param fieldPath The value to verify.
 * @throws if the string can't be used as a field path.
 */
export declare function validateFieldPath(arg: string | number, fieldPath: unknown): void;
export {};
