/**
 * External dependencies
 */
import { isEqual } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	__experimentalBlock as Block,
	BlockIcon,
} from '@wordpress/block-editor';
import { Placeholder } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import TableOfContentsList from './list';
import {
	getHeadingsFromHeadingElements,
	linearToNestedHeadingList,
} from './utils';

/** @typedef {import('@wordpress/element').WPComponent} WPComponent */

/**
 * @typedef WPTableOfContentsEditProps
 *
 * @param {string|undefined} className
 */

/**
 * Table of Contents block edit component.
 *
 * @param {WPTableOfContentsEditProps} props The props.
 *
 * @return {WPComponent} The component.
 */
export default function TableOfContentsEdit( { className } ) {
	// Local state; not saved to block attributes. The saved block is dynamic and uses PHP to generate its content.
	const [ headings, setHeadings ] = useState( [] );

	const postContent = useSelect( ( select ) => {
		return select( 'core/editor' ).getEditedPostContent();
	}, [] );

	useEffect( () => {
		// Create a temporary container to put the post content into, so we can
		// use the DOM to find all the headings.
		const tempPostContentDOM = document.createElement( 'div' );
		tempPostContentDOM.innerHTML = postContent;

		// Remove template elements so that headings inside them aren't counted.
		// This is only needed for IE11, which doesn't recognize the element and
		// treats it like a div.
		for ( const template of tempPostContentDOM.querySelectorAll(
			'template'
		) ) {
			tempPostContentDOM.removeChild( template );
		}

		const headingElements = tempPostContentDOM.querySelectorAll(
			'h1, h2, h3, h4, h5, h6'
		);

		const latestHeadings = getHeadingsFromHeadingElements(
			headingElements
		);

		if ( ! isEqual( headings, latestHeadings ) ) {
			setHeadings( latestHeadings );
		}
	}, [ postContent ] );

	// If there are no headings or the only heading is empty.
	if ( headings.length === 0 || headings[ 0 ].content === '' ) {
		return (
			<Block.div>
				<Placeholder
					className="wp-block-table-of-contents"
					icon={ <BlockIcon icon="list-view" /> }
					label="Table of Contents"
					instructions={ __(
						'Start adding Heading blocks to create a table of contents. Headings with HTML anchors will be linked here.'
					) }
				/>
			</Block.div>
		);
	}

	return (
		<Block.nav className={ className }>
			<TableOfContentsList
				nestedHeadingList={ linearToNestedHeadingList( headings ) }
			/>
		</Block.nav>
	);
}
