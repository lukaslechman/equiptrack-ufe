import { newE2EPage } from '@stencil/core/testing';

describe('xle-equip-app', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<xle-equip-app></xle-equip-app>');

    const element = await page.find('xle-equip-app');
    expect(element).toHaveClass('hydrated');
  });
});
