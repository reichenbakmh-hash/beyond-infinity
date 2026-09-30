export const roomInteractions = [
  {
    id: 'phone',
    model: 'phone',
    label: 'Téléphone',
    at: [2.4, 0.82, -5.5],
    place: [2.4, 0.769, -5.5],
    rotY: 0.4,
    radius: 2.4,
    steps: [
      { do: 'sfx', name: 'tap' },
      { do: 'phone', view: 'beginning' },
      { do: 'collect', item: 'video' },
      { do: 'collect', item: 'music' },
      { do: 'flag', key: 'phoneDone' },
      { do: 'wait', ms: 700 },
      { do: 'say', text: 'Quelque chose vient de s\'ouvrir.' },
      { do: 'event', name: 'openDoor' }
    ],
    after: [
      { do: 'sfx', name: 'tap' },
      { do: 'phone', view: 'beginning' }
    ]
  },
  {
    id: 'clock',
    model: 'clock',
    label: 'Horloge',
    at: [2.55, 1.75, -5.95],
    place: [2.55, 1.75, -5.975],
    radius: 3.4,
    steps: [
      { do: 'sfx', name: 'pop' },
      { do: 'collect', item: 'clock' },
      { do: 'say', text: 'Arrêtée sur 00:11.' }
    ],
    after: [{ do: 'say', text: 'Toujours 00:11.' }]
  },
  {
    id: 'strawberry',
    model: 'strawberry',
    label: 'Fraise',
    at: [3.15, 0.83, -5.45],
    place: [3.15, 0.765, -5.45],
    radius: 2.2,
    steps: [
      { do: 'sfx', name: 'pop' },
      { do: 'collect', item: 'strawberry' },
      { do: 'say', text: 'Une fraise.' }
    ],
    after: [{ do: 'say', text: 'Elle est toujours là.' }]
  },
  {
    id: 'tulip',
    model: 'tulip',
    label: 'Tulipe',
    at: [3.72, 1.1, 0.8],
    place: [3.72, 0.9, 0.8],
    radius: 2.4,
    steps: [
      { do: 'sfx', name: 'pop' },
      { do: 'collect', item: 'tulip' },
      { do: 'say', text: 'Une tulipe.' }
    ],
    after: [{ do: 'say', text: 'Pas une rose.' }]
  },
  {
    id: 'cat',
    model: 'cat',
    label: 'Chat',
    at: [-3.85, 1.15, -1.7],
    place: [-3.86, 1.01, -1.7],
    rotY: 1.5708,
    radius: 2.6,
    requires: 'phoneDone',
    steps: [
      { do: 'sfx', name: 'pop' },
      { do: 'collect', item: 'cat' },
      { do: 'say', text: 'Il n\'était pas là tout à l\'heure.' }
    ],
    after: [{ do: 'say', text: 'Il n\'a pas bougé.' }]
  },
  {
    id: 'door',
    model: 'door',
    label: 'Porte',
    at: [0, 1.2, -5.9],
    place: [0, 0, -5.96],
    radius: 3.4,
    requires: 'doorOpen',
    steps: [{ do: 'event', name: 'enterDoor' }]
  }
];
