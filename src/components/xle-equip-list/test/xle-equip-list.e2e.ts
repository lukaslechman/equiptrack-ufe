import { newE2EPage } from '@stencil/core/testing';

describe('xle-equip-list', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<xle-equip-list></xle-equip-list>');

    const element = await page.find('xle-equip-list');
    expect(element).toHaveClass('hydrated');
  });
});
