'use strict';

import {ComponentState} from './component-state.model';
import {localStorage as storage} from './../app.module';

/** @classdesc Represents an interface for Angular2 components (classes) that can be persisted in local storage
	*  for later reuse, e.g. when opening the app in offline mode and wishing to recreate its most recent state
*/
export interface PersistableComponent {
	/** Commits the component's current state to local storage */
	storeState(): Promise<number>;
	
	/** Retrieves and recreates the component's latest state from local storage.
	 * Interface provides a default implementation.
	 */
	restoreState(componentName?: string): Promise<ComponentState>;
}

// Default implementations (mix in with applyMixins in realizing class)
export class PersistableComponent_Defaults {
	/** Retrieves and recreates the component's latest state from local storage */
	public restoreState(componentName: string): Promise<ComponentState> {
		return storage.getAll(true)
			.then((json: any) => {
				let modelId: number
				for (let key in json) { // get state object from storage (seems like a generic feature that storage should support itself)
					if (json[key]._className === 'ComponentState'
						&& json[key]._componentName === componentName ) {
							modelId = parseInt(key);
					}
				}
				if (!isNaN(modelId)) {
					let state: ComponentState = new ComponentState(modelId);
					return state.readObject(state, true)
				}
				else {
					return Promise.resolve(undefined);
				}
			})
			.catch((e) => {
				return Promise.reject(e);
			});
	}
}