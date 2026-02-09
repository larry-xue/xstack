import { Button, createTheme, Input, rem, TextInput } from '@mantine/core'
import type { MantineColorsTuple } from '@mantine/core'

const notion: MantineColorsTuple = [
  '#f7f7f5',
  '#efefed',
  '#e9e9e7',
  '#d7d7d4',
  '#b7b7b2',
  '#979791',
  '#787774',
  '#5c5b58',
  '#2f3437',
  '#1f2325',
]

export const notionTheme = createTheme({
  primaryColor: 'notion',
  colors: {
    notion,
  },
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif',
  headings: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif',
    fontWeight: '600',
  },
  defaultRadius: 'sm',
  radius: {
    xs: rem(4),
    sm: rem(6),
    md: rem(8),
    lg: rem(10),
    xl: rem(14),
  },
  focusRing: 'auto',
  cursorType: 'pointer',
  components: {
    Button: Button.extend({
      defaultProps: {
        radius: 'sm',
        size: 'xs',
      },
      styles: {
        root: {
          fontWeight: 500,
          letterSpacing: 0,
          transition: 'background-color 140ms ease, border-color 140ms ease, color 140ms ease',
        },
      },
      vars: (_theme, props) => {
        const isCompact = props.size === 'xs' || props.size === 'sm'
        return {
          root: {
            '--button-height': isCompact ? rem(30) : rem(34),
          },
        }
      },
    }),
    Input: Input.extend({
      defaultProps: {
        radius: 'sm',
      },
      styles: {
        input: {
          height: rem(32),
          minHeight: rem(32),
          transition: 'border-color 140ms ease, box-shadow 140ms ease',
        },
      },
    }),
    TextInput: TextInput.extend({
      defaultProps: {
        radius: 'sm',
      },
    }),
  },
})
