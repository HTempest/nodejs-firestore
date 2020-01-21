"use strict";
// Copyright 2018 Google LLC
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
const through2 = require("through2");
const Firestore = require("../src/index");
const helpers_1 = require("../test/util/helpers");
function createInstance(opts, document) {
    const overrides = {
        batchGetDocuments: () => {
            const stream = through2.obj();
            setImmediate(() => {
                stream.push({ found: document, readTime: { seconds: 5, nanos: 6 } });
                stream.push(null);
            });
            return stream;
        },
    };
    return helpers_1.createInstance(overrides, opts);
}
const DOCUMENT_WITH_TIMESTAMP = helpers_1.document('documentId', 'moonLanding', {
    timestampValue: {
        nanos: 123000123,
        seconds: -14182920,
    },
});
const DOCUMENT_WITH_EMPTY_TIMESTAMP = helpers_1.document('documentId', 'moonLanding', {
    timestampValue: {},
});
describe('timestamps', () => {
    it('returned by default', () => {
        return createInstance({}, DOCUMENT_WITH_TIMESTAMP).then(firestore => {
            const expected = new Firestore.Timestamp(-14182920, 123000123);
            return firestore
                .doc('collectionId/documentId')
                .get()
                .then(res => {
                chai_1.expect(res.data()['moonLanding'].isEqual(expected)).to.be.true;
                chai_1.expect(res.get('moonLanding').isEqual(expected)).to.be.true;
            });
        });
    });
    it('retain seconds and nanoseconds', () => {
        return createInstance({}, DOCUMENT_WITH_TIMESTAMP).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .get()
                .then(res => {
                const timestamp = res.get('moonLanding');
                chai_1.expect(timestamp.seconds).to.equal(-14182920);
                chai_1.expect(timestamp.nanoseconds).to.equal(123000123);
            });
        });
    });
    it('convert to date', () => {
        return createInstance({}, DOCUMENT_WITH_TIMESTAMP).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .get()
                .then(res => {
                const timestamp = res.get('moonLanding');
                chai_1.expect(new Date(-14182920 * 1000 + 123).getTime()).to.equal(timestamp.toDate().getTime());
            });
        });
    });
    it('convert to millis', () => {
        return createInstance({}, DOCUMENT_WITH_TIMESTAMP).then(firestore => {
            return firestore
                .doc('collectionId/documentId')
                .get()
                .then(res => {
                const timestamp = res.get('moonLanding');
                chai_1.expect(-14182920 * 1000 + 123).to.equal(timestamp.toMillis());
            });
        });
    });
    it('support missing values', () => {
        return createInstance({}, DOCUMENT_WITH_EMPTY_TIMESTAMP).then(firestore => {
            const expected = new Firestore.Timestamp(0, 0);
            return firestore
                .doc('collectionId/documentId')
                .get()
                .then(res => {
                chai_1.expect(res.get('moonLanding').isEqual(expected)).to.be.true;
            });
        });
    });
    it('constructed using helper', () => {
        chai_1.expect(Firestore.Timestamp.now()).to.be.an.instanceOf(Firestore.Timestamp);
        let actual = Firestore.Timestamp.fromDate(new Date(123123));
        let expected = new Firestore.Timestamp(123, 123000000);
        chai_1.expect(actual.isEqual(expected)).to.be.true;
        actual = Firestore.Timestamp.fromMillis(123123);
        expected = new Firestore.Timestamp(123, 123000000);
        chai_1.expect(actual.isEqual(expected)).to.be.true;
    });
    it('validates nanoseconds', () => {
        chai_1.expect(() => new Firestore.Timestamp(0.1, 0)).to.throw('Value for argument "seconds" is not a valid integer.');
        chai_1.expect(() => new Firestore.Timestamp(0, 0.1)).to.throw('Value for argument "nanoseconds" is not a valid integer.');
        chai_1.expect(() => new Firestore.Timestamp(0, -1)).to.throw('Value for argument "nanoseconds" must be within [0, 999999999] inclusive, but was: -1');
        chai_1.expect(() => new Firestore.Timestamp(0, 1000000000)).to.throw('Value for argument "nanoseconds" must be within [0, 999999999] inclusive, but was: 1000000000');
    });
});
//# sourceMappingURL=timestamp.js.map