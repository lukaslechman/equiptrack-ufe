import { Component, Host, Event,Prop,State, EventEmitter, h } from '@stencil/core';
import { EquipmentRegistryApi, Equipment, Configuration } from '../../api/equipment-registry';


@Component({
  tag: 'xle-equip-list',
  styleUrl: 'xle-equip-list.css',
  shadow: true,
})

export class XleEquipList {
  @Event({ eventName: "entry-clicked" }) entryClicked: EventEmitter<string>;
  @Prop() apiBase: string;
  @State() errorMessage: string;

  equipment: Equipment[];

  private async getEquipmentAsync(): Promise<Equipment[]> {
    try {
      const configuration = new Configuration({ basePath: this.apiBase });
      const api = new EquipmentRegistryApi(configuration);
      const response = await api.listEquipmentRaw({});
      if (response.raw.status < 299) {
        return await response.value();
      } else {
        this.errorMessage = `Nepodarilo sa načítať vybavenie: ${response.raw.statusText}`;
      }
    } catch (err: any) {
      this.errorMessage = `Nepodarilo sa načítať vybavenie: ${err.message || "unknown"}`;
    }
    return [];
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
          {this.equipment?.map(item =>
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
          onClick={() => this.entryClicked.emit("@new")}>
          <md-icon>add</md-icon>
        </md-filled-icon-button>
      </Host>
    );
  }
}