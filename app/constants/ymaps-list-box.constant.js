export default function (listBoxItems, reducer) {
    const listBoxOptions =
    {
        data: {
            content: 'Слои',
            title: 'Слои'
        },
        items: listBoxItems,
        options: { checkbox: true },
        state: {
            expanded: true,
            filters: listBoxItems.reduce(reducer, {})
        }
    }

    return listBoxOptions;
}