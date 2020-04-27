/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';
import { renderToString } from '@wordpress/element';

/**
 * Internal dependencies
 */
import TableOfContentsList from './list';
import { linearToNestedHeadingList } from './utils';

const transforms = {
	to: [
		{
			type: 'block',
			blocks: [ 'core/list' ],
			transform( { headings } ) {
				return createBlock( 'core/list', {
					values: renderToString(
						<TableOfContentsList
							wrapList={ false }
							nestedHeadingList={ linearToNestedHeadingList(
								headings
							) }
						/>
					),
				} );
			},
		},
	],
};

export default transforms;
