import docCategoryType from './docCategory'
import { BookIcon, ThListIcon } from '@sanity/icons'
import { format, parseISO } from 'date-fns'
import { defineField, defineType } from 'sanity'

/**
 * This file is the schema definition for a post.
 *
 * Here you'll be able to edit the different fields that appear when you 
 * create or edit a post in the studio.
 * 
 * Here you can see the different schema types that are available:

  https://www.sanity.io/docs/schema-types

 */

export default defineType({
  name: 'features',
  title: 'Features',
  icon: ThListIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Feature Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category->title',
      media: 'coverImage',
    },
    prepare({ title, media, category }) {
      const subtitles = [category && `by ${category}`].filter(Boolean)

      return { title, media, subtitle: subtitles.join(' ') }
    },
  },
})
