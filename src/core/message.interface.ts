/** @classdesc Represents an interface for objects that contain a message about a customer journey (leg)
*/

export interface Message {
	header?: string;
	text: string;
	links?: Array<string>;
}