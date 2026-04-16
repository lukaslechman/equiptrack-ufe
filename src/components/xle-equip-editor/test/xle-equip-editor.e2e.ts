import { newE2EPage } from '@stencil/core/testing';

describe('xle-equip-editor', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<xle-equip-editor></xle-equip-editor>');

    const element = await page.find('xle-equip-editor');
    expect(element).toHaveClass('hydrated');
  });
});
