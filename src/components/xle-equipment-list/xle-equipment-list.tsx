import { Component, Host, Event, EventEmitter, h } from '@stencil/core';
import '@material/web/list/list';
import '@material/web/list/list-item';
import '@material/web/icon/icon';
import '@material/web/fab/fab';

@Component({
  tag: 'xle-equipment-list',
  styleUrl: 'xle-equipment-list.css',
  shadow: true,
})
export class XleEquipmentList {

  @Event({ eventName: "entry-clicked" }) entryClicked: EventEmitter<string>;

  equipment: any[];

  private async getEquipmentAsync() {
    return await Promise.resolve([
      {
        id: '1',
        name: 'Röntgen EVO-3000',
        category: 'Zobrazovacie prístroje',
        serialNumber: 'RX-2021-00123',
        status: 'active',
        location: { building: 'Budova A', department: 'Rádiológia', room: 'M-12' },
      },
      {
        id: '2',
        name: 'EKG Monitor CardioLife',
        category: 'Monitorovacie prístroje',
        serialNumber: 'CL-2019-00456',
        status: 'damaged',
        location: { building: 'Budova B', department: 'Kardiológia', room: 'M-03' },
      },
      {
        id: '3',
        name: 'Infúzna pumpa InfuMed',
        category: 'Infúzna technika',
        serialNumber: 'IM-2020-00789',
        status: 'active',
        location: { building: 'Budova A', department: 'Chirurgia', room: 'M-07' },
      },
      {
        id: '4',
        name: 'Defibrilátor ShockPro',
        category: 'Záchranárska technika',
        serialNumber: 'SP-2018-00321',
        status: 'decommissioned',
        location: { building: 'Budova C', department: 'OAIM', room: 'M-01' },
      },
    ]);
  }

  async componentWillLoad() {
    this.equipment = await this.getEquipmentAsync();
  }

  private getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Aktívne';
      case 'damaged': return 'Poškodené';
      case 'decommissioned': return 'Vyradené';
      default: return status;
    }
  }

  render() {
    return (
      <Host>
        <md-list>
          {this.equipment.map(item =>
            <md-list-item onClick={() => this.entryClicked.emit(item.id)}>
              <div slot="headline">{item.name}</div>
              <div slot="supporting-text">
                {item.location.department} | SN: {item.serialNumber}
              </div>
              <div slot="trailing-supporting-text">
                <span class={`status-badge status-${item.status}`}>
                  {this.getStatusLabel(item.status)}
                </span>
              </div>
              <md-icon slot="start">medical_services</md-icon>
            </md-list-item>
          )}
        </md-list>

        <md-filled-icon-button class="add-button"
          onclick={() => this.entryClicked.emit("@new")}>
          <md-icon>add</md-icon>
        </md-filled-icon-button>
      </Host>
    );
  }
}