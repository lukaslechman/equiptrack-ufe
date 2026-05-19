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

  @State() isLoading: boolean = false;
  @State() filterStatus: string = "";
  @State() filterCategory: string = "";

  equipment: Equipment[];

  private async getEquipmentAsync(): Promise<Equipment[]> {
    this.isLoading = true;
    try {
      const config = new Configuration({ basePath: this.apiBase });
      const api = new EquipmentRegistryApi(config);
      const response = await api.listEquipmentRaw({
        status: this.filterStatus as any || undefined,
        category: this.filterCategory || undefined,
      });
      if (response.raw.status < 299) {
        return await response.value();
      } else {
        this.errorMessage = `Chyba ${response.raw.status}: ${response.raw.statusText}`;
      }
    } catch (err: any) {
      this.errorMessage = `Nepodarilo sa načítať: ${err.message || "Skontrolujte pripojenie"}`;
    } finally {
      this.isLoading = false;
    }
    return [];
  }

  async componentWillLoad() {
    this.equipment = await this.getEquipmentAsync();
  }

  private async applyFilters() {
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
        {/* Filter panel */}
        <div class="filter-bar">
          <md-filled-select
            label="Stav"
            oninput={(ev: InputEvent) => {
              this.filterStatus = (ev.target as HTMLInputElement).value;
              this.applyFilters();
            }}>
            <md-select-option value="">Všetky stavy</md-select-option>
            <md-select-option value="active">Aktívne</md-select-option>
            <md-select-option value="damaged">Poškodené</md-select-option>
            <md-select-option value="decommissioned">Vyradené</md-select-option>
          </md-filled-select>

          <md-filled-select
            label="Kategória"
            oninput={(ev: InputEvent) => {
              this.filterCategory = (ev.target as HTMLInputElement).value;
              this.applyFilters();
            }}>
            <md-select-option value="">Všetky kategórie</md-select-option>
            <md-select-option value="imaging">Zobrazovacie</md-select-option>
            <md-select-option value="monitoring">Monitorovacie</md-select-option>
            <md-select-option value="infusion">Infúzna technika</md-select-option>
            <md-select-option value="surgical">Chirurgické</md-select-option>
            <md-select-option value="emergency">Záchranárske</md-select-option>
          </md-filled-select>
        </div>

        {/* Obsah */}
        {this.isLoading
          ? <div class="loading"><span>Načítavam...</span></div>
          : this.errorMessage
            ? <div class="error">{this.errorMessage}</div>
            : this.equipment.length === 0
              ? <div class="empty-state">
                  <md-icon>inventory_2</md-icon>
                  <span>Žiadne vybavenie nenájdené</span>
                </div>
              : <md-list>
                  {this.equipment.map(item =>
                    <md-list-item onClick={() => this.entryClicked.emit(item.id)}>
                      <div slot="headline">{item.name}</div>
                      <div slot="supporting-text">
                        {item.location?.department} | SN: {item.serialNumber}
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
        }

        <md-filled-icon-button class="add-button"
          onclick={() => this.entryClicked.emit("@new")}>
          <md-icon>add</md-icon>
        </md-filled-icon-button>
      </Host>
    );
  }
}