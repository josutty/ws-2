import type { Preview } from '@storybook/react';
import { withThemeByClassName } from '@storybook/addon-themes';
import '../src/shared/ui/theme/base.css';

const preview: Preview = {
  decorators: [withThemeByClassName({ themes: { light: '', dark: 'dark' }, defaultTheme: 'light' })],
};

export default preview;
