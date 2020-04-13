/**
 * WordPress dependencies
 */
import { create } from '@wordpress/rich-text';

/**
 * Takes a flat list of heading parameters and nests them based on each header's
 * immediate parent's level.
 *
 * @param {Array}  headingList The flat list of headings to nest.
 * @param {number} index        The current list index.
 * @return {Array} The nested list of headings.
 */
export function linearToNestedHeadingList( headingList, index = 0 ) {
	const nestedHeadingList = [];

	headingList.forEach( ( heading, key ) => {
		if ( heading.content === undefined ) {
			return;
		}

		// Make sure we are only working with the same level as the first iteration in our set.
		if ( heading.level === headingList[ 0 ].level ) {
			// Check that the next iteration will return a value.
			// If it does and the next level is greater than the current level,
			// the next iteration becomes a child of the current interation.
			if (
				headingList[ key + 1 ] !== undefined &&
				headingList[ key + 1 ].level > heading.level
			) {
				// We need to calculate the last index before the next iteration that has the same level (siblings).
				// We then use this last index to slice the array for use in recursion.
				// This prevents duplicate nodes.
				let endOfSlice = headingList.length;
				for ( let i = key + 1; i < headingList.length; i++ ) {
					if ( headingList[ i ].level === heading.level ) {
						endOfSlice = i;
						break;
					}
				}

				// We found a child node: Push a new node onto the return array with children.
				nestedHeadingList.push( {
					block: heading,
					index: index + key,
					children: linearToNestedHeadingList(
						headingList.slice( key + 1, endOfSlice ),
						index + key + 1
					),
				} );
			} else {
				// No child node: Push a new node onto the return array.
				nestedHeadingList.push( {
					block: heading,
					index: index + key,
					children: null,
				} );
			}
		}
	} );

	return nestedHeadingList;
}

/**
 * Extracts text, anchor, and level from a list of heading blocks.
 *
 * @param {Array} headingBlocks The list of heading blocks.
 * @return {Array} The list of heading parameters.
 */
export function convertBlocksToHeadingList( headingBlocks ) {
	return headingBlocks.map( ( heading ) => {
		const { anchor, content } = heading.attributes;

		// Strip HTML from heading to use as the table of contents entry.
		const plainContent = content ? create( { html: content } ).text : '';

		const level = heading.attributes.level;

		return { anchor, content: plainContent, level };
	} );
}
