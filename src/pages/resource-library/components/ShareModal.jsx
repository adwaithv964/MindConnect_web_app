import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const ShareModal = ({ resource, onClose, onShare }) => {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [includeNote, setIncludeNote] = useState(false);
  const [note, setNote] = useState('');

  const trustedCircle = [
  {
    id: 1,
    name: 'Sarah Johnson',
    relationship: 'Friend',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1de624978-1763294904808.png",
    avatarAlt: 'Professional headshot of Caucasian woman with blonde hair in casual blue top'
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    relationship: 'Counsellor',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1bc33dc0e-1763298859535.png",
    avatarAlt: 'Professional headshot of Asian male doctor with short black hair in white coat'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    relationship: 'Family',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_14652f2bb-1763296569890.png",
    avatarAlt: 'Professional headshot of Hispanic woman with long brown hair in green blouse'
  }];


  const handleContactToggle = (contactId, checked) => {
    if (checked) {
      setSelectedContacts([...selectedContacts, contactId]);
    } else {
      setSelectedContacts(selectedContacts?.filter((id) => id !== contactId));
    }
  };

  const handleShare = () => {
    onShare({
      resourceId: resource?.id,
      contacts: selectedContacts,
      note: includeNote ? note : null
    });
    onClose();
  };

  if (!resource) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="font-heading font-semibold text-xl text-foreground">Share Resource</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-colors duration-150"
            aria-label="Close share modal">

            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 rounded-lg bg-muted border border-border">
            <h3 className="font-medium text-sm text-foreground mb-1">{resource?.title}</h3>
            <p className="text-xs text-muted-foreground">{resource?.contentType} • {resource?.duration}</p>
          </div>

          <div>
            <h4 className="font-medium text-sm text-foreground mb-3">Share with Trusted Circle</h4>
            <div className="space-y-3">
              {trustedCircle?.map((contact) =>
              <div key={contact?.id} className="flex items-center gap-3">
                  <Checkbox
                  checked={selectedContacts?.includes(contact?.id)}
                  onChange={(e) => handleContactToggle(contact?.id, e?.target?.checked)} />

                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                      <img
                      src={contact?.avatar}
                      alt={contact?.avatarAlt}
                      className="w-full h-full object-cover" />

                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{contact?.name}</p>
                      <p className="text-xs text-muted-foreground">{contact?.relationship}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <Checkbox
              label="Include a personal note"
              checked={includeNote}
              onChange={(e) => setIncludeNote(e?.target?.checked)} />

            {includeNote &&
            <textarea
              value={note}
              onChange={(e) => setNote(e?.target?.value)}
              placeholder="Add a message about why you're sharing this resource..."
              className="w-full mt-3 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={4} />

            }
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button
              variant="default"
              fullWidth
              onClick={handleShare}
              disabled={selectedContacts?.length === 0}
              iconName="Send"
              iconPosition="left">

              Share Resource
            </Button>
            <Button
              variant="outline"
              onClick={onClose}>

              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>);

};

export default ShareModal;