import { Component, Host, Prop, State, h } from '@stencil/core';

declare global {
  interface Window { navigation: any; }
}

@Component({
  tag: 'xle-equip-app',
  styleUrl: 'xle-equip-app.css',
  shadow: true,
})
export class XleEquipApp {

  @State() private relativePath = "";
  @Prop() basePath: string = "";
  @Prop() apiBase: string;

  componentWillLoad() {
    const baseUri = new URL(this.basePath, document.baseURI || "/").pathname;

    const toRelative = (path: string) => {
      if (path.startsWith(baseUri)) {
        this.relativePath = path.slice(baseUri.length);
      } else {
        this.relativePath = "";
      }
    };

    window.navigation?.addEventListener("navigate", (ev: Event) => {
      if ((ev as any).canIntercept) { (ev as any).intercept(); }
      let path = new URL((ev as any).destination.url).pathname;
      toRelative(path);
    });

    toRelative(location.pathname);
  }


  render() {
let element = "list";
    let entryId = "@new";

    if (this.relativePath.startsWith("entry/")) {
      element = "editor";
      entryId = this.relativePath.split("/")[1];
    }

    const navigate = (path: string) => {
      const absolute = new URL(path, new URL(this.basePath, document.baseURI)).pathname;
      window.navigation.navigate(absolute);
    };

    return (
      <Host>
        <header class="app-header">
          <md-icon>inventory_2</md-icon>
          <span>Majetková evidencia</span>
        </header>

        <main>
          {element === "editor"
            ? <xle-equip-editor
                entry-id={entryId}
                api-base={this.apiBase}
                oneditor-closed={() => navigate("./list")}
              />
            : <xle-equip-list
                api-base={this.apiBase}
                onentry-clicked={(ev: CustomEvent<string>) =>
                  navigate("./entry/" + ev.detail)
                }
              />
          }
        </main>
      </Host>
    );
  }
}
