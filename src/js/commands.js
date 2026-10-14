export class Commands {
    static registry = new Map();

    static init() {
        $(document).on("click.commands", "[command]", event => {
            const button = $(event.currentTarget);
            const handler = Commands.registry.get(button.attr("command"));
            if (handler) {
                handler(button, button.data());
            }
        });

        Commands.register("--open-url", (button, data) => {
            window.open(data.url);
        });
    }

    static register(command, handler) {
        Commands.registry.set(command, handler);
    }
}
