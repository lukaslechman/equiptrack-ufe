import { newSpecPage } from '@stencil/core/testing';
import { XleEquipList } from '../xle-equip-list';

describe('xle-equipm-list', () => {
    it('renders', async () => {
      const page = await newSpecPage({
          components: [XleEquipList],
          html: `<xle-equip-list></xle-equip-list>`,
      });

      const eList = page.rootInstance as XleEquipList;
      const expectedEquipment = eList?.equipment?.length

      const items = page.root.shadowRoot.querySelectorAll("md-list-item");
      expect(items.length).toEqual(expectedEquipment);
      
    });
});
