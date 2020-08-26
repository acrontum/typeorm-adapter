"use strict";
// Copyright 2018 The Casbin Authors. All Rights Reserved.
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const casbin_1 = require("casbin");
const casbinRule_1 = require("./casbinRule");
const typeorm_1 = require("typeorm");
const casbinMongoRule_1 = require("./casbinMongoRule");
/**
 * TypeORMAdapter represents the TypeORM filtered adapter for policy storage.
 */
class TypeORMAdapter {
    constructor(option, findOptions) {
        this.filtered = false;
        this.option = option;
        this.findOptions = findOptions;
    }
    isFiltered() {
        return this.filtered;
    }
    /**
     * newAdapter is the constructor.
     * @param option typeorm connection option
     */
    static newAdapter(option, findOptions = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const defaults = {
                synchronize: true,
                name: 'node-casbin-official',
            };
            const entities = {
                entities: option.entities ? option.entities : [this.getCasbinRuleType(option.type)],
            };
            const configuration = Object.assign(defaults, option);
            const a = new TypeORMAdapter(Object.assign(configuration, entities), findOptions);
            yield a.open();
            return a;
        });
    }
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            this.typeorm = yield typeorm_1.createConnection(this.option);
            if (!this.typeorm.isConnected) {
                yield this.typeorm.connect();
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.typeorm.isConnected) {
                yield this.typeorm.close();
            }
        });
    }
    clearTable() {
        return __awaiter(this, void 0, void 0, function* () {
            yield typeorm_1.getRepository(this.getCasbinRuleConstructor(), this.option.name).clear();
        });
    }
    loadPolicyLine(line, model) {
        const result = line.ptype + ', ' + [line.v0, line.v1, line.v2, line.v3, line.v4, line.v5].filter(n => n).join(', ');
        casbin_1.Helper.loadPolicyLine(result, model);
    }
    /**
     * loadPolicy loads all policy rules from the storage.
     */
    loadPolicy(model) {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = yield typeorm_1.getRepository(this.getCasbinRuleConstructor(), this.option.name).find(this.findOptions);
            for (const line of lines) {
                this.loadPolicyLine(line, model);
            }
        });
    }
    // Loading policies based on filter condition
    loadFilteredPolicy(model, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const filteredLines = yield typeorm_1.getRepository(this.getCasbinRuleConstructor(), this.option.name).find(filter);
            for (const line of filteredLines) {
                this.loadPolicyLine(line, model);
            }
            this.filtered = true;
        });
    }
    savePolicyLine(ptype, rule) {
        const line = new (this.getCasbinRuleConstructor())();
        line.ptype = ptype;
        if (rule.length > 0) {
            line.v0 = rule[0];
        }
        if (rule.length > 1) {
            line.v1 = rule[1];
        }
        if (rule.length > 2) {
            line.v2 = rule[2];
        }
        if (rule.length > 3) {
            line.v3 = rule[3];
        }
        if (rule.length > 4) {
            line.v4 = rule[4];
        }
        if (rule.length > 5) {
            line.v5 = rule[5];
        }
        return line;
    }
    /**
     * savePolicy saves all policy rules to the storage.
     */
    savePolicy(model) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.clearTable();
            let astMap = model.model.get('p');
            const lines = [];
            // @ts-ignore
            for (const [ptype, ast] of astMap) {
                for (const rule of ast.policy) {
                    const line = this.savePolicyLine(ptype, rule);
                    lines.push(line);
                }
            }
            astMap = model.model.get('g');
            // @ts-ignore
            for (const [ptype, ast] of astMap) {
                for (const rule of ast.policy) {
                    const line = this.savePolicyLine(ptype, rule);
                    lines.push(line);
                }
            }
            const queryRunner = this.typeorm.createQueryRunner();
            yield queryRunner.connect();
            yield queryRunner.startTransaction();
            try {
                yield queryRunner.manager.save(lines);
                yield queryRunner.commitTransaction();
            }
            catch (err) {
                yield queryRunner.rollbackTransaction();
                throw err;
            }
            finally {
                yield queryRunner.release();
            }
            return true;
        });
    }
    /**
     * addPolicy adds a policy rule to the storage.
     */
    addPolicy(sec, ptype, rule) {
        return __awaiter(this, void 0, void 0, function* () {
            const line = this.savePolicyLine(ptype, rule);
            yield typeorm_1.getRepository(this.getCasbinRuleConstructor(), this.option.name).save(line);
        });
    }
    /**
     * addPolicies adds policy rules to the storage.
     */
    addPolicies(sec, ptype, rules) {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = [];
            for (const rule of rules) {
                const line = this.savePolicyLine(ptype, rule);
                lines.push(line);
            }
            const queryRunner = this.typeorm.createQueryRunner();
            yield queryRunner.connect();
            yield queryRunner.startTransaction();
            try {
                yield queryRunner.manager.save(lines);
                yield queryRunner.commitTransaction();
            }
            catch (err) {
                yield queryRunner.rollbackTransaction();
                throw err;
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
    /**
     * removePolicy removes a policy rule from the storage.
     */
    removePolicy(sec, ptype, rule) {
        return __awaiter(this, void 0, void 0, function* () {
            const line = this.savePolicyLine(ptype, rule);
            yield typeorm_1.getRepository(this.getCasbinRuleConstructor(), this.option.name).delete(line);
        });
    }
    /**
     * removePolicies removes policy rules from the storage.
     */
    removePolicies(sec, ptype, rules) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryRunner = this.typeorm.createQueryRunner();
            const type = TypeORMAdapter.getCasbinRuleType(this.option.type);
            yield queryRunner.connect();
            yield queryRunner.startTransaction();
            try {
                for (const rule of rules) {
                    const line = this.savePolicyLine(ptype, rule);
                    yield queryRunner.manager.delete(type, line);
                }
                yield queryRunner.commitTransaction();
            }
            catch (err) {
                yield queryRunner.rollbackTransaction();
                throw err;
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
    /**
     * removeFilteredPolicy removes policy rules that match the filter from the storage.
     */
    removeFilteredPolicy(sec, ptype, fieldIndex, ...fieldValues) {
        return __awaiter(this, void 0, void 0, function* () {
            const line = new (this.getCasbinRuleConstructor())();
            line.ptype = ptype;
            if (fieldIndex <= 0 && 0 < fieldIndex + fieldValues.length) {
                line.v0 = fieldValues[0 - fieldIndex];
            }
            if (fieldIndex <= 1 && 1 < fieldIndex + fieldValues.length) {
                line.v1 = fieldValues[1 - fieldIndex];
            }
            if (fieldIndex <= 2 && 2 < fieldIndex + fieldValues.length) {
                line.v2 = fieldValues[2 - fieldIndex];
            }
            if (fieldIndex <= 3 && 3 < fieldIndex + fieldValues.length) {
                line.v3 = fieldValues[3 - fieldIndex];
            }
            if (fieldIndex <= 4 && 4 < fieldIndex + fieldValues.length) {
                line.v4 = fieldValues[4 - fieldIndex];
            }
            if (fieldIndex <= 5 && 5 < fieldIndex + fieldValues.length) {
                line.v5 = fieldValues[5 - fieldIndex];
            }
            yield typeorm_1.getRepository(this.getCasbinRuleConstructor(), this.option.name).delete(line);
        });
    }
    getCasbinRuleConstructor() {
        if (this.option.entities) {
            return this.option.entities[0];
        }
        return TypeORMAdapter.getCasbinRuleType(this.option.type);
    }
    /**
     * Returns either a {@link CasbinRule} or a {@link CasbinMongoRule}, depending on the type. This switch is required as the normal
     * {@link CasbinRule} does not work when using MongoDB as a backend (due to a missing ObjectID field).
     * @param type
     */
    static getCasbinRuleType(type) {
        if (type === 'mongodb') {
            return casbinMongoRule_1.CasbinMongoRule;
        }
        return casbinRule_1.CasbinRule;
    }
}
exports.default = TypeORMAdapter;
