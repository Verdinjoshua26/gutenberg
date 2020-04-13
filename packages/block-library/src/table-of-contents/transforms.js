/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';
import { renderToString } from '@wordpress/element';

/**
 * Internal dependencies
 */
import List from './list';
import { linearToNestedHeadingList } from './utils';

const transforms = {
	to: [
		{
			type: 'block',
			blocks: [ 'core/list' ],
			transform: ( { headings } ) => {
				return createBlock( 'core/list', {
					values: renderToString(
						<List noWrapList>
							{ linearToNestedHeadingList( headings ) }
						</List>
					),
				} );
			},
		},
	],
};

export default transforms;
