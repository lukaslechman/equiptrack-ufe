import { Component, Host, Prop, State, Event, EventEmitter, h } from '@stencil/core';
import { EquipmentRegistryApi, Equipment, Configuration,   EquipmentStatus,EquipmentStatusUpdate} from '../../api/equipment-registry';


@Component({
  tag: 'xle-equip-editor',
  styleUrl: 'xle-equip-editor.css',
  shadow: true,
})
export class XleEquipEditor {
  @Prop() entryId: string;
  @Prop() apiBase: string;

  @Event({ eventName: "editor-closed" }) editorClosed: EventEmitter<string>;

  @State() entry: any;
  @State() errorMessage: string;
  @State() isValid: boolean = false;
  @State() showArchiveDialog: boolean = false;
  @State() showDeleteDialog: boolean = false; 
  @State() isLoading: boolean = false;



  private formElement: HTMLFormElement;


  async componentWillLoad() {
    if (this.entryId === "@new") {
      this.entry = {
        id: "@new", name: "", category: "imaging",
        manufacturer: "", serialNumber: "",
        purchaseDate: "",    // ← string pre input field
        warrantyUntil: "",
        lifespanYears: 5, purchasePrice: 0,
        status: "active", note: "",
        location: { building: "", department: "", room: "" }
      };
      return;
    }

    this.isLoading = true;
    try {
      const api = new EquipmentRegistryApi(
        new Configuration({ basePath: this.apiBase })
      );
      const response = await api.getEquipmentRaw({ equipmentId: this.entryId });
      if (response.raw.status < 299) {
        const data = await response.value();
        // konvertuj Date objekty späť na stringy pre input field
        this.entry = {
          ...data,
          purchaseDate: data.purchaseDate 
            ? (data.purchaseDate instanceof Date 
                ? data.purchaseDate.toISOString().split('T')[0]
                : String(data.purchaseDate))
            : "",
          warrantyUntil: data.warrantyUntil
            ? (data.warrantyUntil instanceof Date
                ? data.warrantyUntil.toISOString().split('T')[0]
                : String(data.warrantyUntil))
            : "",
        };
        this.isValid = true;
      } else {
        this.errorMessage = `Chyba ${response.raw.status}: ${response.raw.statusText}`;
      }
    } catch (err: any) {
      this.errorMessage = `Nepodarilo sa načítať: ${err.message || "unknown"}`;
    } finally {
      this.isLoading = false;
    }
  }

  private async saveEntry() {
  if (!this.validateForm('show-errors')) return;

  try {
    const api = new EquipmentRegistryApi(
      new Configuration({ basePath: this.apiBase })
    );

    // konvertuj date stringy na Date objekty
    const entryToSave = {
      ...this.entry,
      purchaseDate: this.entry.purchaseDate 
        ? new Date(this.entry.purchaseDate) 
        : undefined,
      warrantyUntil: this.entry.warrantyUntil 
        ? new Date(this.entry.warrantyUntil) 
        : undefined,
    };

    const response = this.entryId === "@new"
      ? await api.createEquipmentRaw({ equipment: entryToSave })
      : await api.updateEquipmentRaw({ equipmentId: this.entryId, equipment: entryToSave });

    if (response.raw.status < 299) {
      this.editorClosed.emit("store");
    } else {
      this.errorMessage = `Nepodarilo sa uložiť: ${response.raw.statusText}`;
    }
  } catch (err: any) {
    this.errorMessage = `Nepodarilo sa uložiť: ${err.message || "unknown"}`;
  }
}

  private handleInput(field: string, value: string) {
    this.entry = { ...this.entry, [field]: value };
    this.validateForm('silent');
  }

  private handleLocationInput(field: string, value: string) {
    this.entry = {
      ...this.entry,
      location: { ...this.entry.location, [field]: value }
    };
  }

  private validateForm(mode: 'silent' | 'show-errors'): boolean {
    this.isValid = true;
    if (!this.formElement) return false;

    for (let i = 0; i < this.formElement.children.length; i++) {
      const el = this.formElement.children[i] as HTMLElement & {
        checkValidity?: () => boolean;
        reportValidity?: () => boolean;
      };
      let valid = true;
      if (mode === 'show-errors' && el.reportValidity) {
        valid = el.reportValidity();
      } else if (el.checkValidity) {
        valid = el.checkValidity();
      }
      this.isValid &&= valid;
    }
    return this.isValid;
  }



private async archiveEntry() {
  try {
    const api = new EquipmentRegistryApi(
      new Configuration({ basePath: this.apiBase })
    );
    const response = await api.updateEquipmentStatusRaw({
      equipmentId: this.entryId,
      equipmentStatusUpdate: { status: EquipmentStatus.Decommissioned }
    });
    if (response.raw.status < 299) {
      this.showArchiveDialog = false;
      this.editorClosed.emit("archive");
    } else {
      this.errorMessage = `Nepodarilo sa vyradiť: ${response.raw.statusText}`;
    }
  } catch (err: any) {
    this.errorMessage = `Nepodarilo sa vyradiť: ${err.message || "unknown"}`;
  }
}

private async deleteEntry() {
  try {
    const api = new EquipmentRegistryApi(
      new Configuration({ basePath: this.apiBase })
    );
    const response = await api.deleteEquipmentRaw({
      equipmentId: this.entryId
    });
    if (response.raw.status < 299) {
      this.showDeleteDialog = false;
      this.editorClosed.emit("delete");
    } else {
      this.errorMessage = `Nepodarilo sa zmazať: ${response.raw.statusText}`;
    }
  } catch (err: any) {
    this.errorMessage = `Nepodarilo sa zmazať: ${err.message || "unknown"}`;
  }
}


  render() {

      if (this.isLoading) {
        return (
          <Host>
            <div class="loading">
              <span>Načítavam...</span>
            </div>
          </Host>
        );
      }

      if (this.errorMessage) {
        return (
          <Host>
            <div class="error">{this.errorMessage}</div>
            <md-outlined-button onClick={() => this.editorClosed.emit("cancel")}>
              Späť
            </md-outlined-button>
          </Host>
        );
      }

    return (
      <Host>
        <h2 class="editor-title">
          <md-icon>{this.entryId === "@new" ? "add_box" : "edit"}</md-icon>
          {this.entryId === "@new" ? "Nové vybavenie" : "Upraviť vybavenie"}
        </h2>

        <form ref={el => this.formElement = el}>

          {/* Základné info */}
          <section class="form-section">
            <h3>Základné informácie</h3>

            <md-filled-text-field
              label="Názov vybavenia" required
              pattern=".*\S.*"
              value={this.entry?.name}
              oninput={(ev: InputEvent) =>
                this.handleInput('name', (ev.target as HTMLInputElement).value)
              }>
              <md-icon slot="leading-icon">label</md-icon>
            </md-filled-text-field>

            <md-filled-select
              label="Kategória" required
              value={this.entry?.category}
              oninput={(ev: InputEvent) =>
                this.handleInput('category', (ev.target as HTMLInputElement).value)
              }>
              <md-icon slot="leading-icon">category</md-icon>
              <md-select-option value="imaging">
                <div slot="headline">Zobrazovacie prístroje</div>
              </md-select-option>
              <md-select-option value="monitoring">
                <div slot="headline">Monitorovacie prístroje</div>
              </md-select-option>
              <md-select-option value="infusion">
                <div slot="headline">Infúzna technika</div>
              </md-select-option>
              <md-select-option value="surgical">
                <div slot="headline">Chirurgické nástroje</div>
              </md-select-option>
              <md-select-option value="emergency">
                <div slot="headline">Záchranárska technika</div>
              </md-select-option>
            </md-filled-select>

            <md-filled-text-field
              label="Výrobca" required
              pattern=".*\S.*"
              value={this.entry?.manufacturer}
              oninput={(ev: InputEvent) =>
                this.handleInput('manufacturer', (ev.target as HTMLInputElement).value)
              }>
              <md-icon slot="leading-icon">factory</md-icon>
            </md-filled-text-field>

            <md-filled-text-field
              label="Sériové číslo" required
              pattern="[A-Za-z0-9\-]+"

              value={this.entry?.serialNumber}
              oninput={(ev: InputEvent) =>
                this.handleInput('serialNumber', (ev.target as HTMLInputElement).value)
              }>
              <md-icon slot="leading-icon">tag</md-icon>
            </md-filled-text-field>
          </section>

          <md-divider></md-divider>

          {/* Finančné a časové info */}
          <section class="form-section">
            <h3>Nákup a životnosť</h3>

            <md-filled-text-field
              label="Dátum nákupu" type="date" required
              value={this.entry?.purchaseDate}
              oninput={(ev: InputEvent) =>
                this.handleInput('purchaseDate', (ev.target as HTMLInputElement).value)
              }>
              <md-icon slot="leading-icon">calendar_today</md-icon>
            </md-filled-text-field>

            <md-filled-text-field
              label="Záruka do" type="date"
              value={this.entry?.warrantyUntil}
              oninput={(ev: InputEvent) => {
                  const val = (ev.target as HTMLInputElement).value;
                  const el = ev.target as HTMLInputElement & { setCustomValidity: (s: string) => void };
                  if (this.entry?.purchaseDate && val < this.entry.purchaseDate) {
                    el.setCustomValidity('Záruka nemôže byť pred dátumom nákupu');
                  } else {
                    el.setCustomValidity('');
                  }
                  this.handleInput('warrantyUntil', val);
                }}>
              <md-icon slot="leading-icon">verified_user</md-icon>
            </md-filled-text-field>

            <md-filled-text-field
              label="Životnosť (roky)" type="number"
              min="2"
              value={String(this.entry?.lifespanYears??2)}
              oninput={(ev: InputEvent) =>
                this.handleInput('lifespanYears', (ev.target as HTMLInputElement).value)
              }>
              <md-icon slot="leading-icon">hourglass_top</md-icon>
            </md-filled-text-field>

            <md-filled-text-field
              label="Obstarávacia cena (€)" type="number"
              min="0"
              value={String(this.entry?.purchasePrice ?? 0)}
              oninput={(ev: InputEvent) =>
                this.handleInput('purchasePrice', (ev.target as HTMLInputElement).value)
              }>
              <md-icon slot="leading-icon">euro</md-icon>
            </md-filled-text-field>
          </section>

          <md-divider></md-divider>

          {/* Umiestnenie */}
          <section class="form-section">
            <h3>Umiestnenie</h3>

            <md-filled-text-field
              label="Budova"
              value={this.entry?.location?.building}
              oninput={(ev: InputEvent) =>
                this.handleLocationInput('building', (ev.target as HTMLInputElement).value)
              }>
              <md-icon slot="leading-icon">apartment</md-icon>
            </md-filled-text-field>

            <md-filled-text-field
              label="Oddelenie"
              value={this.entry?.location?.department}
              oninput={(ev: InputEvent) =>
                this.handleLocationInput('department', (ev.target as HTMLInputElement).value)
              }>
              <md-icon slot="leading-icon">door_front</md-icon>
            </md-filled-text-field>

            <md-filled-text-field
              label="Miestnosť"
              value={this.entry?.location?.room}
              oninput={(ev: InputEvent) =>
                this.handleLocationInput('room', (ev.target as HTMLInputElement).value)
              }>
              <md-icon slot="leading-icon">meeting_room</md-icon>
            </md-filled-text-field>
          </section>

          <md-divider></md-divider>

          {/* Poznámka */}
          <section class="form-section">
            <md-filled-text-field
              label="Poznámka" type="textarea"
              value={this.entry?.note}
              oninput={(ev: InputEvent) =>
                this.handleInput('note', (ev.target as HTMLInputElement).value)
              }>
              <md-icon slot="leading-icon">note</md-icon>
            </md-filled-text-field>
          </section>

        </form>

        {/* Akcie */}
        <div class="actions">
          <md-filled-tonal-button
            disabled={!this.entry || this.entryId === "@new"}
            onClick={() => this.showArchiveDialog = true}>
            <md-icon slot="icon">archive</md-icon>
            Vyradiť
          </md-filled-tonal-button>

          <md-filled-tonal-button class="btn-delete"
            disabled={!this.entry || this.entryId === "@new"}
            onClick={() => this.showDeleteDialog = true}>
            <md-icon slot="icon">delete</md-icon>
            Zmazať
          </md-filled-tonal-button>

          <span class="stretch-fill"></span>

          <md-outlined-button onClick={() => this.editorClosed.emit("cancel")}>
            Zrušiť
          </md-outlined-button>

          <md-filled-button onClick={() => this.saveEntry()}>
            <md-icon slot="icon">save</md-icon>
            Uložiť
          </md-filled-button>
        </div>

        {/* Potvrdzovací dialog pre vyradenie */}
        {this.showArchiveDialog && (
          <md-dialog open>
            <div slot="headline">Vyradiť vybavenie?</div>
            <div slot="content">
              Záznam bude archivovaný a označený ako vyradený.
              Táto akcia je nevratná.
            </div>
            <div slot="actions">
              <md-outlined-button onClick={() => this.showArchiveDialog = false}>
                Zrušiť
              </md-outlined-button>
              <md-filled-button onClick={() => this.archiveEntry()}>
                Potvrdiť
              </md-filled-button>
            </div>
          </md-dialog>
        )}

        {this.showDeleteDialog && (
          <md-dialog open>
            <div slot="headline">Zmazať vybavenie?</div>
            <div slot="content">
              Záznam bude <strong>natrvalo vymazaný</strong> z evidencie.
              Táto akcia je nevratná.
            </div>
            <div slot="actions">
              <md-outlined-button onClick={() => this.showDeleteDialog = false}>
                Zrušiť
              </md-outlined-button>
              <md-filled-button onClick={() => this.deleteEntry()}>
                <md-icon slot="icon">delete</md-icon>
                Zmazať
              </md-filled-button>
            </div>
          </md-dialog>
        )}
      </Host>
    );
      
  }
}
