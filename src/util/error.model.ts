/* A subset of Java inspired extentions to the native JS Error class */

/** Java-like error for when trying to invoke an abstract method (including interface method signatures) */
export class AbstractMethodError extends Error{
	public name: string =  'AbstractMethodError';
	//public stack = (new Error()).stack;
	constructor(public message = 'Abstract method cannot be invoked') {super(message);}
}

/** Java-like error for when trying to use an undefined class */
export class ClassNotFoundError extends Error{
	public name: string =  'ClassNotFoundError';
	//public stack = (new Error()).stack;
	constructor(public message = 'Class not found') {super(message);}
}

/** Java-like error for when trying to access an attribute or a method without permission */
export class IllegalAccessError extends Error{
	public name: string =  'IllegalAccessError';
	//public stack = (new Error()).stack;
	constructor(public message = 'Illegal access') {super(message);}
}

/** Java-like error for when trying to invoke a method with an illegal parameter (including trying to set a read-only attribute) */
export class IllegalArgumentError extends Error{
	public name: string =  'IllegalArgumentError';
	//public stack = (new Error()).stack;
	constructor(public message = 'Illegal argument') {super(message);}
}

/** Java-like error for when trying to instantiate an abstract class or interface (including interface method signatures) */
export class InstantiationError extends Error{
	public name: string =  'InstantiationError';
	//public stack = (new Error()).stack;
	constructor(public message = 'Instantiation not permitted') {super(message);}
}