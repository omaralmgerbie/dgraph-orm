/**
 * methods
 * 
 * dgraph-orm Model methods
 * 
 * @author Ashok Vishwakarma <akvlko@gmail.com>
 */

import { MethodsType } from "../types";

const eq: string = "eq";
const type: string = "type";

const uid: string = "uid";

const allofterms: string = "allofterms";

const anyofterms: string = "anyofterms";

const regexp: string = "regexp";

const anyoftext: string = "anyoftext";

const alloftext: string = "alloftext";

const has: string = "has";

const near: string = "near";

const contains: string = "contains";

const Methods: MethodsType = {
  type,
  eq,
  uid,
  allofterms,
  anyofterms,
  regexp,
  anyoftext,
  alloftext,
  has,
  near,
  contains,
};
export default Methods;
