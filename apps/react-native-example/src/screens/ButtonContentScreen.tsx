import { GoNext, Save, UserTrash } from '@gnome-ui/icons';
import { ButtonContent, Card, Icon, Text } from '@gnome-ui/react-native';
import { Pressable } from 'react-native';

import { Section } from '../Section';

export const ButtonContentScreen = () => {
  return (
    <>
      <Section
        title="Icon + label, icon first (default)"
        description="Same 6 dp gap Button already produces internally"
      >
        <Pressable onPress={() => {}}>
          <Card>
            <ButtonContent icon={<Icon icon={Save} size="sm" />} label="Save" color="accent" />
          </Card>
        </Pressable>
      </Section>

      <Section title="Icon after the label" description="iconPosition=&quot;end&quot;">
        <Pressable onPress={() => {}}>
          <Card>
            <ButtonContent
              icon={<Icon icon={GoNext} size="sm" />}
              label="Advanced settings"
              iconPosition="end"
            />
          </Card>
        </Pressable>
      </Section>

      <Section
        title="Label colors"
        description="No currentColor here — pass color to match the context"
      >
        <Card>
          <ButtonContent
            icon={<Icon icon={UserTrash} size="sm" />}
            label="Delete account"
            color="destructive"
          />
        </Card>
      </Section>

      <Section
        title="Not just for Button"
        description="Button already has leadingIcon/trailingIcon — this is for everything else"
      >
        <Text variant="caption" color="dim">
          {
            'Reach for this when composing icon+label content outside this package’s own Button — a bespoke Pressable, a custom card action, anywhere the same Adwaita spacing convention is wanted.'
          }
        </Text>
      </Section>
    </>
  );
};
