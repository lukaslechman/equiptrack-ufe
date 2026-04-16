import { newSpecPage } from '@stencil/core/testing';
import { XleEquipApp } from '../xle-equip-app';

describe('xle-equip-app', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [XleEquipApp],
      html: `<xle-equip-app></xle-equip-app>`,
    });
    expect(page.root).toEqualHtml(`
      <xle-equip-app>
        <mock:shadow-root>
          <header class="app-header">
            <md-icon>inventory_2</md-icon>
            <span>Majetková evidencia</span>
          </header>
          <main>
            <xle-equip-list></xle-equip-list>
          </main>
        </mock:shadow-root>
      </xle-equip-app>
    `);
  });
});