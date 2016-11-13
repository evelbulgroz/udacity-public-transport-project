/** @classdesc Represents an interface for objects that contain a note about a customer journey (leg)
*/

export interface Note {
	text: string;
	from?: number;
	to?: number;
}