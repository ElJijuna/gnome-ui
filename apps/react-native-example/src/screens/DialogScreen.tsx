import { Button, Dialog } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const DialogScreen = () => {
  const [standard, setStandard] = useState(false);
  const [withButtons, setWithButtons] = useState(false);
  const [alert, setAlert] = useState(false);
  const [noBackdropClose, setNoBackdropClose] = useState(false);

  return (
    <>
      <Section title="Standard" description="Title + body, dismissible via backdrop">
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button variant="flat" onPress={() => setStandard(true)}>
            Open
          </Button>
        </View>
        <Dialog open={standard} title="About Sync" onClose={() => setStandard(false)}>
          Files are synced automatically every 15 minutes while connected to Wi-Fi.
        </Dialog>
      </Section>

      <Section title="With buttons" description="Standard dialog API — buttons[] + onPress">
        <Button variant="flat" onPress={() => setWithButtons(true)}>
          Open
        </Button>
        <Dialog
          open={withButtons}
          title="Discard changes?"
          onClose={() => setWithButtons(false)}
          buttons={[
            { label: 'Keep editing', onPress: () => setWithButtons(false) },
            {
              label: 'Discard',
              variant: 'destructive',
              onPress: () => setWithButtons(false),
            },
          ]}
        >
          Your changes have not been saved.
        </Dialog>
      </Section>

      <Section title="Alert" description="role=alertdialog — responses[] + onResponse">
        <Button variant="flat" onPress={() => setAlert(true)}>
          Delete file
        </Button>
        <Dialog
          open={alert}
          role="alertdialog"
          title="Delete file?"
          responses={[
            { id: 'cancel', label: 'Cancel' },
            { id: 'delete', label: 'Delete', variant: 'destructive' },
          ]}
          onResponse={() => setAlert(false)}
        >
          This action cannot be undone.
        </Dialog>
      </Section>

      <Section title="closeOnBackdrop=false" description="Only the explicit button can dismiss it">
        <Button variant="flat" onPress={() => setNoBackdropClose(true)}>
          Open
        </Button>
        <Dialog
          open={noBackdropClose}
          title="Updating…"
          closeOnBackdrop={false}
          buttons={[{ label: 'Cancel', onPress: () => setNoBackdropClose(false) }]}
        >
          Please wait while the app updates.
        </Dialog>
      </Section>
    </>
  );
};
