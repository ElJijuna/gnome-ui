import { GoNext, Save, UserTrash } from '@gnome-ui/icons';
import { BoxedList, ButtonRow, Icon } from '@gnome-ui/react-native';

import { Section } from '../Section';

export const ButtonRowScreen = () => {
  return (
    <>
      <Section title="Variants" description="Full-width activatable row, centered label">
        <BoxedList>
          <ButtonRow title="Add device" onPress={() => {}} />
          <ButtonRow title="Save changes" variant="suggested" onPress={() => {}} />
          <ButtonRow title="Delete account" variant="destructive" onPress={() => {}} />
        </BoxedList>
      </Section>

      <Section title="Leading and trailing icons" description="Flanking the centered label">
        <BoxedList>
          <ButtonRow
            title="Save"
            variant="suggested"
            leading={<Icon icon={Save} size="sm" />}
            onPress={() => {}}
          />
          <ButtonRow
            title="Delete Account"
            variant="destructive"
            leading={<Icon icon={UserTrash} size="sm" />}
            onPress={() => {}}
          />
          <ButtonRow
            title="Advanced settings"
            trailing={<Icon icon={GoNext} size="sm" />}
            onPress={() => {}}
          />
        </BoxedList>
      </Section>

      <Section title="Disabled" description="opacity dims, press is inert">
        <BoxedList>
          <ButtonRow title="Restore purchase" disabled onPress={() => {}} />
        </BoxedList>
      </Section>
    </>
  );
};
