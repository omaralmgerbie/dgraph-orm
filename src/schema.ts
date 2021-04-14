/**
 * Schema
 * 
 * dgraph-orm Schema class
 * 
 * @author Ashok Vishwakarma <akvlko@gmail.com>
 */

/**
 * helper utilities
 */
import { checkOptions, prepareSchema } from "./helpers/utility";

import { FieldProps, SchemaFields } from "./types";

/**
 * Schema
 * 
 * Schema class
 */
class Schema {
  /**
   * name
   * 
   * @type string
   */
  name: string;

  /**
   * schema
   * 
   * @type Array<string>
   */
  schema: Array<string>;

  /**
   * original
   * 
   * @type SchemaFields
   */
  original: SchemaFields;

  /**
   * 
   * @param name {string}
   * @param schema {SchemaFields}
   */
  constructor(name: string, original: SchemaFields) {
    this.name = name;
    this.original = original;

    this.schema = this._generate(name, original);
  }

  /**
   * _build
   * @param name {string} 
   * @param params {string | FieldProps}
   * 
   * @returns string
   */
  private _build(name: string, params: string | FieldProps): string {
    checkOptions(name, params);
    return prepareSchema(name, params);
  }

  /**
   * _generate
   * @param name {string}
   * @param original {SchemaFields}
   * 
   * @returns Array<string>
   */
  private _generate(name: string, original: SchemaFields): Array<string> {
    const _schema: Array<string> = [];
    let _type: string = `type ${name} {`;
    Object.keys(original).forEach((key: string) => {
      _schema.push(this._build(key, original[key]));
      _type = `${_type}\n${key}`;
    });
    _type = `${_type}\n}`;
    _schema.push(_type);
    return _schema;
  }
}

export default Schema;
