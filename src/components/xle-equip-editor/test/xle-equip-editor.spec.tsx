import { newSpecPage } from '@stencil/core/testing';
import { XleEquipEditor } from '../xle-equip-editor';

describe('xle-equip-editor', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [XleEquipEditor],
      html: `<xle-equip-editor></xle-equip-editor>`,
    });
    expect(page.root).toEqualHtml(`
      <xle-equip-editor>
        <mock:shadow-root>
          <div class="error">
            Nepodarilo sa načítať záznam: Required parameter requestParameters.equipmentId was null or undefined when calling getEquipment.
          </div>
          <md-outlined-button>
            Späť
          </md-outlined-button>
        </mock:shadow-root>
      </xle-equip-editor>
    `);
  });
});