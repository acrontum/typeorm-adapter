import { Model, FilteredAdapter } from 'casbin';
import { ConnectionOptions, FindManyOptions } from 'typeorm';
/**
 * TypeORMAdapter represents the TypeORM filtered adapter for policy storage.
 */
export default class TypeORMAdapter implements FilteredAdapter {
    private option;
    private findOptions;
    private typeorm;
    private filtered;
    private constructor();
    public isFiltered(): boolean;
    /**
     * newAdapter is the constructor.
     * @param option typeorm connection option
     */
    public static newAdapter(option: ConnectionOptions, findOptions?: FindManyOptions): Promise<TypeORMAdapter>;
    private open;
    public close(): Promise<void>;
    private clearTable;
    private loadPolicyLine;
    /**
     * loadPolicy loads all policy rules from the storage.
     */
    public loadPolicy(model: Model): Promise<void>;
    public loadFilteredPolicy(model: Model, filter: object): Promise<void>;
    private savePolicyLine;
    /**
     * savePolicy saves all policy rules to the storage.
     */
    public savePolicy(model: Model): Promise<boolean>;
    /**
     * addPolicy adds a policy rule to the storage.
     */
    public addPolicy(sec: string, ptype: string, rule: string[]): Promise<void>;
    /**
     * addPolicies adds policy rules to the storage.
     */
    public addPolicies(sec: string, ptype: string, rules: string[][]): Promise<void>;
    /**
     * removePolicy removes a policy rule from the storage.
     */
    public removePolicy(sec: string, ptype: string, rule: string[]): Promise<void>;
    /**
     * removePolicies removes policy rules from the storage.
     */
    public removePolicies(sec: string, ptype: string, rules: string[][]): Promise<void>;
    /**
     * removeFilteredPolicy removes policy rules that match the filter from the storage.
     */
    public removeFilteredPolicy(sec: string, ptype: string, fieldIndex: number, ...fieldValues: string[]): Promise<void>;
    private getCasbinRuleConstructor;
    /**
     * Returns either a {@link CasbinRule} or a {@link CasbinMongoRule}, depending on the type. This switch is required as the normal
     * {@link CasbinRule} does not work when using MongoDB as a backend (due to a missing ObjectID field).
     * @param type
     */
    private static getCasbinRuleType;
}
