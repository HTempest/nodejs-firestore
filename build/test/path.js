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
const path_1 = require("../src/path");
const PROJECT_ID = 'test-project';
const DATABASE_ROOT = `projects/${PROJECT_ID}/databases/(default)`;
describe('ResourcePath', () => {
    it('has id property', () => {
        chai_1.expect(new path_1.QualifiedResourcePath(PROJECT_ID, '(default)', 'foo').id).to.equal('foo');
        chai_1.expect(new path_1.QualifiedResourcePath(PROJECT_ID, '(default)').id).to.be.null;
    });
    it('has append() method', () => {
        let path = new path_1.QualifiedResourcePath(PROJECT_ID, '(default)');
        chai_1.expect(path.formattedName).to.equal(`${DATABASE_ROOT}/documents`);
        path = path.append('foo');
        chai_1.expect(path.formattedName).to.equal(`${DATABASE_ROOT}/documents/foo`);
    });
    it('has parent() method', () => {
        let path = new path_1.QualifiedResourcePath(PROJECT_ID, '(default)', 'foo');
        chai_1.expect(path.formattedName).to.equal(`${DATABASE_ROOT}/documents/foo`);
        path = path.parent();
        chai_1.expect(path.formattedName).to.equal(`${DATABASE_ROOT}/documents`);
        chai_1.expect(path.parent()).to.be.null;
    });
    it('parses strings', () => {
        let path = path_1.QualifiedResourcePath.fromSlashSeparatedString(DATABASE_ROOT);
        chai_1.expect(path.formattedName).to.equal(`${DATABASE_ROOT}/documents`);
        path = path_1.QualifiedResourcePath.fromSlashSeparatedString(`${DATABASE_ROOT}/documents/foo`);
        chai_1.expect(path.formattedName).to.equal(`${DATABASE_ROOT}/documents/foo`);
        chai_1.expect(() => {
            path = path_1.QualifiedResourcePath.fromSlashSeparatedString('projects/project/databases');
        }).to.throw("Resource name 'projects/project/databases' is not valid");
    });
    it('accepts newlines', () => {
        const path = path_1.QualifiedResourcePath.fromSlashSeparatedString(`${DATABASE_ROOT}/documents/foo\nbar`);
        chai_1.expect(path.formattedName).to.equal(`${DATABASE_ROOT}/documents/foo\nbar`);
    });
});
describe('FieldPath', () => {
    it('encodes field names', () => {
        const components = [['foo'], ['foo', 'bar'], ['.', '`'], ['\\']];
        const results = ['foo', 'foo.bar', '`.`.`\\``', '`\\\\`'];
        for (let i = 0; i < components.length; ++i) {
            chai_1.expect(new path_1.FieldPath(...components[i]).toString()).to.equal(results[i]);
        }
    });
    it("doesn't accept empty path", () => {
        chai_1.expect(() => {
            new path_1.FieldPath();
        }).to.throw('Function "FieldPath()" requires at least 1 argument.');
    });
    it('only accepts strings', () => {
        chai_1.expect(() => {
            new path_1.FieldPath('foo', 'bar', 0);
        }).to.throw('Element at index 2 is not a valid string.');
    });
    it('has append() method', () => {
        let path = new path_1.FieldPath('foo');
        path = path.append('bar');
        chai_1.expect(path.formattedName).to.equal('foo.bar');
    });
    it('has parent() method', () => {
        let path = new path_1.FieldPath('foo', 'bar');
        path = path.parent();
        chai_1.expect(path.formattedName).to.equal('foo');
    });
    it('escapes special characters', () => {
        const path = new path_1.FieldPath('f.o.o');
        chai_1.expect(path.formattedName).to.equal('`f.o.o`');
    });
    it("doesn't allow empty components", () => {
        chai_1.expect(() => {
            new path_1.FieldPath('foo', '');
        }).to.throw('Element at index 1 should not be an empty string.');
    });
    it('has isEqual() method', () => {
        const path = new path_1.FieldPath('a');
        const equals = new path_1.FieldPath('a');
        const notEquals = new path_1.FieldPath('a', 'b', 'a');
        chai_1.expect(path.isEqual(equals)).to.be.true;
        chai_1.expect(path.isEqual(notEquals)).to.be.false;
    });
});
//# sourceMappingURL=path.js.map