export class Singleton {
    static __singleton = {};

    constructor() {
        const name = this.constructor.singletonName ?? this.constructor.name;
        if (self['__s__'] && self['__s__'][name]) {
            throw new Error('You cannot initialize this class twice');
        }
    }

    static get singletonName() {
        return undefined;
    }

    static get() {
        const name = this.singletonName ?? this.name;
        if(!self['__s__']) {
            self['__s__'] = {};
        }
        if (!self['__s__'][name]) {
            self['__s__'][name] = new this();
        }
        return self['__s__'][name];
    }
}
