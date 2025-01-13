/**
 * Using JSON.stringify() with any BigInt value will raise a TypeError,
 * as BigInt values aren't serialized in JSON by default. However,
 * JSON.stringify() specifically leaves a backdoor for BigInt values:
 * it would try to call the BigInt's toJSON() method. Therefore, this
 * implementation enables the usage of JSON.stringify() with objects
 * containing BigInt values.
 */

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export {};
