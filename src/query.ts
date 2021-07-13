/**
 * Query
 * 
 * dgraph-orm Query class
 * 
 * @author Ashok Vishwakarma <akvlko@gmail.com>
 */

/**
 * methods
 * 
 * dgraph-orm model methods
 */
import methods from "./helpers/methods";

import { Include, Params } from "./types";

/**
 * _conditions
 * 
 * @type Array<string>
 */
const _conditions: Array<string> = ["or", "and"];

/**
 * Query
 * 
 * Class Query
 */
class Query {
  /**
   * name
   * 
   * @type string
   */
  private name: string;

  /**
   * nest
   * 
   * @type boolean
   */
  private nest: boolean;

  /**
   * params
   * 
   * @type Params
   */
  private params: Params;

  /**
   * type
   * 
   * @type string
   */
  private type: string;

  /**
   * field
   * 
   * @type string
   */
  private field: string;

  /**
   * value
   * 
   * @type any
   */
  private value: any;

  /**
   * logger
   * 
   * @type Function
   */
  private logger: Function;

  /**
   * where
   * 
   * @type any
   */
  private where: any;

  /**
   * query
   * 
   * @type string
   */
  query: string;

  /**
   * constructor
   * @param type {string}
   * @param field {string}
   * @param value {any}
   * @param params {Params}
   * @param nest {boolean}
   * @param name {string}
   * @param logger {Function}
   */
  constructor(
    type: string,
    field: string,
    value: any,
    params: Params,
    name: string,
    logger: Function,
    nest: boolean=false,
  ) {
    this.nest = nest;
    this.name = name;
    this.params = params;
    this.type = type;
    this.field = field;
    this.value = value;
    this.logger = logger;
    this.where = this._where(this.type, this.field, this.value, this.name);
    this.query = this._build(this.params);
  }

  /**
   * _where
   * @param type {string} 
   * @param field {string}
   * @param value {any}
   * @param name {string}
   * 
   * @returns string
   */
  private _where(
    type: string,
    field: string,
    value: any,
    name: string,
  ): string {
    let _where = "";

    switch (type) {
      case methods.eq:
      case methods.allofterms:
      case methods.alloftext:
      case methods.anyofterms:
      case methods.anyoftext:
        _where = `(func: ${type}(${field}, ${'"' + value +
          '"'}){{ORDER}}{{LIMIT}})`;
        break;

      case methods.regexp:
        _where = `(func: ${type}(${field}, ${value}){{ORDER}}{{LIMIT}})`;
        break;

      case methods.uid:
        if (Array.isArray(field)) {
          field = field.join(", ");
        }
        _where = `(func: ${methods.uid}(${field}){{ORDER}}{{LIMIT}})`;
        break;
      case methods.type:
        if (Array.isArray(field)) {
          field = field.join(", ");
        }
        _where = `(func: ${methods.type}(${field}){{ORDER}}{{LIMIT}})`;
        break;

      case methods.has:
        _where = `(func: ${methods.has}(${field}){{ORDER}}{{LIMIT}})`;
        break;

      case methods.near:
        _where =
          `(func: ${methods.near}(${field}, [${value.longitude}, ${value.latitude}], ${value.distance}){{ORDER}}{{LIMIT}})`;
        break;

      case methods.contains:
        _where =
          `(func: ${methods.contains}(${field}, [${value.longitude}, ${value.latitude}]){{ORDER}}{{LIMIT}})`;
        break;
    }

    return _where;
  }

  /**
   * _filter
   * @param key {string} 
   * @param value {any}
   * @param name {string}
   * 
   * @returns string
   */
  private _filter(key: string, value: any, name: string): string {
    let not = ``
    if (typeof value === "object" && !Array.isArray(value) && value.not) {
      not='NOT'
    }
    if (key.toLowerCase() === "has") {
      let val=(typeof value === "object"?value.value:value)
      return `${not} ${key}(${val})`;
    }
    if (key.toLowerCase() === "uid") {
      let val=(typeof value === "object"?value.value:value)
      return `${not} ${key}(${val})`;
    }
    if (key.toLowerCase() === "type") {
      let val=(typeof value === "object"?value.value:value)
      return `${not} ${key}(${val})`;
    }

    if (typeof value === "string") {
      return `${not} eq(${key}, "${value}")`;
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      const _key = Object.keys(value)[0];

      if (_key) {
        let _value = value[_key];

        if (Array.isArray(_value)) {
          const _sub: Array<string> = [];
          _value.forEach((_val: any) => {
            _sub.push(`${not} uid_in(${key}, "${_val}")`);
          });

          return _sub.join(" OR ");
        }

        if (typeof _value === "string" && _key !== "regexp") {
          _value = '"' + _value + '"';
        }

        if (_key === "ne") {
          return `NOT eq(${key}, ${_value})`;
        }

        return `${not} ${_key}(${key}, ${_value})`;
      }
    }
  }

  /**
   * _parse_filter
   * @param filter {any} 
   * @param name {string}
   * 
   * @returns string
   */
  private _parse_filter(filter: any, name: string): string {
    const _filters: Array<any> = [];

    if (typeof filter !== "undefined") {
      Object.keys(filter).forEach((_key) => {
        if (_conditions.indexOf(_key.toLowerCase()) === -1) {
          _filters.push(this._filter(_key, filter[_key], name));
        } else {
          const _sub: Array<string> = [];
          Object.keys(filter[_key]).forEach((_k) => {
            if (Array.isArray(filter[_key][_k])) {
              filter[_key][_k].forEach((_val: any) => {
                _sub.push(this._filter(_k, _val, name));
              });
            } else {
              _sub.push(this._filter(_k, filter[_key][_k], name));
            }
          });

          if (_sub.length > 0) {
            _filters.push(
              `(${_sub.join(` ${_key.replace("$", "").toUpperCase()} `)})`,
            );
          }
        }
      });
    }

    if (_filters.length > 0) {
      // console.log(name);
      
      return ` @filter(${_filters.join(` ${name==='or'?'OR':'AND'} `)})`;
    }

    return "";
  }

  /**
   * _attributes
   * @param attributes {Array<string>}
   * @param name {string}
   * 
   * @return string
   */
  private _attributes(attributes: Array<string>, name: string): string {
    const _attrs: Array<string> = [];
    for (let attr of attributes) {
      if (attr === "uid") {
        _attrs.push("uid");
      } else {
        _attrs.push(`${attr}`);
      }
    }

    return _attrs.join("\n");
  }

  /**
   * _include
   * @param include {Include}
   * 
   * @returns string
   */
  private _include(include: Include, name: string = this.name): string {
    let _inc: string = "";

    if (!include) {
      return _inc;
    }

    for (let relation of Object.keys(include)) {
      if (include[relation].count) {
        _inc += `${
          include[relation].as ? include[relation].as : relation
        }Count: count(${relation})`;
        // continue;
      }
      if(relation)
      if (include[relation].reverse ) {
        _inc += `
        ${
          include[relation].reverse.name
            ? include[relation].reverse.name
            : `${relation}Reverse`
          }: ~${relation}
          ${include[relation].reverse.filter?
            this._parse_filter(include[relation].reverse.filter, include[relation].model):''
          }
        {
          ${include[relation].reverse.include?this._include(include[relation].reverse.include, include[relation].model):''}
         ${ include[relation].reverse.exclude?'':("expand("+(include[relation].reverse.type?include[relation].reverse.type:'_all_'))+'){}}'}`;
        // continue;
       if(include[relation].as ) 
        _inc += `
        ${
          include[relation].as ? include[relation].as : relation
        }: ${relation}`;
        
        } if (include[relation].extra) {
          try {
            
            _inc += `${relation}: ${include[relation].filter?
              this._parse_filter(include[relation].filter, 'or'):''
            } {`
          } catch (error) {
            console.log(error);
            
          }
        }
      if (include[relation].expand) {
        let type:string;
        if (include[relation].expand.type) {
          type=`expand(${include[relation].expand.type})`
        } else {
          type=`expand(_all_)`
          
        }
        
        _inc += `${relation} {uid
          ${type}
         }`
      } if (include[relation].var&& Array.isArray(include[relation].var)) {
        include[relation].var.forEach((varible:any) => {
          _inc += `
          ${this._var(varible, relation, include[relation].model)}`
        });
      } else if (include[relation].var && !Array.isArray(include[relation].var)) {
        _inc+=this._var(include[relation].var,relation,include[relation].model)
      }
        
      // if (include[relation].var) {
      //   let vName: string=''
      //   let reverse: string = ''
      //   let filter: string = ''
      //   if (typeof include[relation].var === 'string') {
      //     vName=include[relation].var
      //   } else {
      //     vName=include[relation].var.name
          
      //   }
      //   if (include[relation].var.reverse) {
      //     reverse='~'
      //   }
      //   if (include[relation].var.filter) {
      //     console.log(include[relation].var.filter);
      //     filter = this._parse_filter(include[relation].var.filter, include[relation].model)
          
      //   }
      //   _inc+= `${vName} as ${reverse}${relation} ${filter}`
      // }
      if(include[relation].include)
      _inc+=`${this._include(include[relation].include, include[relation].model)}`
      // if (include[relation].var) {
        
      // }
      const _limit: string = this._extras(include[relation]);
      const _order: string = this._parse_order(include[relation].order);

      if (include[relation].filter &&!include[relation].extra) {
        _inc += `${
          this._parse_filter(include[relation].filter, include[relation].model)
        }`;
      }

      if (_limit) {
        _inc += ` (${_limit}) `;
      }

      if (_order) {
        _inc += ` (${_order})`;
      }
      if (Object.keys(include[relation]).length == 0)
      _inc += `{
        ${
        this._attributes(include[relation].attributes, include[relation].model)
      }
        ${this._include(include[relation].include, include[relation].model)}
      }`;
      if ((!include[relation].isNest)&&_inc.charAt(_inc.length - 1) !== '}')
    _inc+='}'
    }
    return _inc;
  }

  private _var(varbs: any,relation:string,model:any) {
    if (varbs) {
      let vName: string=''
      let reverse: string = ''
      let filter: string = ''
      if (typeof varbs === 'string') {
        vName=varbs
      } else {
        vName=varbs.name
        
      }
      if (varbs.reverse) {
        reverse='~'
      }
      if (varbs.filter) {
        // console.log(varbs.filter);
        filter = this._parse_filter(varbs.filter, model)
        
      }
      return `${vName} as ${reverse}${relation} ${filter}`
    }
  }

  /**
   * _extra
   * @param params {Params}
   * 
   * @return string
   */
  private _extras(params: Params): string {
    let _extra = [];

    if (params.first && typeof params.first === "number") {
      _extra.push(`first: ${params.first}`);
    }

    if (params.offset && typeof params.offset === "number") {
      _extra.push(`offset: ${params.offset}`);
    }

    if (params.after) {
      _extra.push(`after: ${params.after}`);
    }

    if (_extra.length > 0) {
      return `${_extra.join(", ")}`;
    }

    return "";
  }

  /**
   * _parse_order
   * @param order {Array<string>}
   * 
   * @returns string 
   */
  private _parse_order(order: Array<any>): string {
    const _order: Array<string> = [];

    if (order && order.length > 0) {
      if (Array.isArray(order[0])) {
        order.forEach((_o: any) => {
          if (typeof _o[1] !== "undefined") {
            _order.push(`order${_o[1].toLowerCase()}: ${this.name}.${_o[0]}`);
          }
        });
      } else {
        _order.push(`order${order[1].toLowerCase()}: ${this.name}.${order[0]}`);
      }
    }

    if (_order.length > 0) {
      return `${_order.join(", ")}`;
    }

    return "";
  }

  /**
   * _build
   * @param params {any}
   * 
   * @returns string
   */
  private _build(params: any): string {
    let _order: string = this._parse_order(params.order);
    let _limit: string = this._extras(params);

    if (_order) {
      _order = `, ${_order}`;
    }

    if (_limit) {
      _limit = `, ${_limit}`;
    }

    const query: string = `${this.nest?'':'{'}
      ${this.name} ${
      this.where.replace("{{ORDER}}", _order).replace("{{LIMIT}}", _limit)
    } ${this._parse_filter(params.filter, this.name)} {
        ${params.exclude?'':this._attributes(params.attributes, this.name)}
        ${this._include(params.include)}
        ${this._expand(params.expand)}
        dgraphType:dgraph.type
        
      }
    ${this.nest?'':'}'}`;

    this.logger(query);

    return query;
  }
  private _expand(expandable: any): string{
    if (typeof expandable === 'string') {
      return `uid
      expand(${expandable}){}`;
    } else if (typeof expandable === 'object') {
      let extraExp:string=''
      if (expandable.expand) {
        extraExp = this._expand(expandable.expand);
      }
      return `uid
      expand(${expandable.name}){
        ${extraExp}
      }`;
    } else return ''
  
  }
}


export default Query;
