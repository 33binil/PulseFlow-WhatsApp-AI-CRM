import React, { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, ArrowLeft, MessageSquare, X } from 'lucide-react';
import { useCRM } from '../context/CRMContext';

export const ContactsListPage = () => {
  const { contacts, addContact, deleteContact } = useCRM();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Kochi, Kerala');
  const [source, setSource] = useState('WhatsApp Inbound');
  const [tagsStr, setTagsStr] = useState('WhatsApp Lead, Inquiry');

  const sources = useMemo(
    () => ['ALL', ...Array.from(new Set(contacts.map((c) => c.source)))],
    [contacts]
  );

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      if (sourceFilter !== 'ALL' && c.source !== sourceFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [contacts, sourceFilter, search]);

  const handleCreate = (e) => {
    e.preventDefault();
    addContact({
      name,
      phone,
      email,
      company,
      location,
      source,
      tags: tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    });
    setShowModal(false);
    setName('');
    setPhone('+91 ');
    setEmail('');
    setCompany('');
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">WhatsApp Customer Directory & Segmentation</div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Contacts ({filteredContacts.length})
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 flex items-center gap-1.5 self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Contact</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg">
            {sources.map((src) => (
              <button
                key={src}
                onClick={() => setSourceFilter(src)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  sourceFilter === src
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {src}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, company, tag..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 px-3 font-semibold">Name & Phone</th>
                <th className="py-2.5 px-3 font-semibold">Company & Location</th>
                <th className="py-2.5 px-3 font-semibold">Source & Tags</th>
                <th className="py-2.5 px-3 font-semibold text-right">Conversations</th>
                <th className="py-2.5 px-3 font-semibold text-right">Messages</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContacts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <Link
                      to={`/contacts/${c.id}`}
                      className="font-bold text-slate-900 hover:underline"
                    >
                      {c.name}
                    </Link>
                    <div className="font-mono text-[11px] text-slate-500 tabular-nums">
                      {c.phone} · {c.email}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-800">{c.company}</div>
                    <div className="text-[11px] text-slate-500">{c.location}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-700 font-medium">{c.source}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {c.tags.join(' · ')}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    {c.totalConversations}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    {c.totalMessages}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => navigate(`/contacts/${c.id}`)}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => deleteContact(c.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Delete Contact"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Create Customer Contact</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg"
                >
                  Create Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const ContactDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contacts, leads, conversations, updateContact, addContactNote } = useCRM();

  const contact = contacts.find((c) => c.id === id) || contacts[0];
  const contactLeads = leads.filter((l) => l.contactId === contact?.id);
  const contactConvs = conversations.filter((c) => c.contactId === contact?.id);

  const [newTag, setNewTag] = useState('');
  const [noteContent, setNoteContent] = useState('');

  if (!contact) {
    return <div className="p-8 text-xs text-slate-500">Contact not found.</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/contacts"
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Contacts Directory</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 mt-1">{contact.name}</h1>
          <div className="text-xs text-slate-500 mt-0.5">
            {contact.phone} · {contact.email} · {contact.company} ({contact.location})
          </div>
        </div>

        {contactConvs[0] && (
          <button
            onClick={() => navigate(`/inbox?convId=${contactConvs[0].id}`)}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open WhatsApp Chat</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Contact Attributes */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Contact Attributes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => updateContact(contact.id, { name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={contact.phone}
                  onChange={(e) => updateContact(contact.id, { phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => updateContact(contact.id, { email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company</label>
                <input
                  type="text"
                  value={contact.company}
                  onChange={(e) => updateContact(contact.id, { company: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Tags Management */}
            <div className="pt-3 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-700 mb-1.5">
                Contact Tags: <span className="font-normal text-slate-600">{contact.tags.join(' · ')}</span>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newTag.trim()) return;
                  updateContact(contact.id, { tags: [...contact.tags, newTag.trim()] });
                  setNewTag('');
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add segmentation tag..."
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg"
                >
                  Add Tag
                </button>
              </form>
            </div>
          </div>

          {/* Linked Leads & Conversation History */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Linked Leads & WhatsApp History</h2>
            {contactLeads.map((ld) => (
              <div
                key={ld.id}
                className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between"
              >
                <div className="text-xs">
                  <div className="font-bold text-slate-900">{ld.interestedService}</div>
                  <div className="text-slate-600 mt-0.5">
                    Score: <span className="font-mono font-bold">{ld.leadScore}/100</span> ·{' '}
                    {ld.leadType} · Stage: {ld.leadStatus} · Budget: {ld.budget}
                  </div>
                </div>
                <Link
                  to={`/leads/${ld.id}`}
                  className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg"
                >
                  Open Lead
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Interaction Stats & Notes */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Interaction Telemetry</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-slate-500">Created Date</dt>
                <dd className="font-mono text-slate-900 tabular-nums">{contact.createdAt}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Last Interaction</dt>
                <dd className="font-mono text-slate-900">{contact.lastInteractionAt}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Total Conversations</dt>
                <dd className="font-mono font-bold text-slate-900 tabular-nums">
                  {contact.totalConversations}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Total WhatsApp Messages</dt>
                <dd className="font-mono font-bold text-slate-900 tabular-nums">
                  {contact.totalMessages}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Contact Notes</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!noteContent.trim()) return;
                addContactNote(contact.id, noteContent);
                setNoteContent('');
              }}
              className="space-y-2 text-xs"
            >
              <textarea
                rows={3}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write a note about this contact..."
                className="w-full p-2.5 border border-slate-200 rounded-lg"
              />
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-white font-semibold rounded-lg"
              >
                Add Note
              </button>
            </form>
            <div className="space-y-2">
              {(contact.notes || []).map((n) => (
                <div key={n.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div className="text-[11px] text-slate-500">
                    {n.authorName} · {n.createdAt}
                  </div>
                  <p className="text-slate-800 mt-1">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
