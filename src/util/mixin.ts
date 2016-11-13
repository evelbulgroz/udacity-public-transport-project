// source: http://www.typescriptlang.org/docs/handbook/mixins.html
// Modified with option not to overwrite overloads in derived class.
var applyMixins = function(derivedCtor: Function, baseCtors: Array<Function>, allowOverLoads: boolean = false) {
   baseCtors.forEach(baseCtor => {
        if (baseCtor) { // some automatic calls (mysteriously) pass in array of undefined, ignore
            Object.getOwnPropertyNames(baseCtor.prototype).forEach((name: string) => {
               if (allowOverLoads && name !== 'constructor' && !baseCtor.prototype.hasOwnProperty(name)) {
                    derivedCtor.prototype[name] = baseCtor.prototype[name];
               }
               //else {console.log(name);}
            });
        }
    });
}
export {applyMixins};