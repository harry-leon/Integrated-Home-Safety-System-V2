import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { smartLockApi } from '../services/api';
import UserAvatar from '../components/UserAvatar';

const PROFILE_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: 'person' },
  { id: 'preferences', label: 'Settings', icon: 'tune' },
  { id: 'logins', label: 'Login activity', icon: 'devices' },
];

const emptyProfileForm = {
  fullName: '',
  phone: '',
  gender: '',
  dateOfBirth: '',
  address: '',
  bio: '',
};

const formatDateTime = (value) => {
  if (!value) return 'Unavailable';
  return new Date(value).toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, applyUserProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSection = PROFILE_SECTIONS.some((item) => item.id === searchParams.get('section'))
    ? searchParams.get('section')
    : 'profile';

  const [activeSection, setActiveSection] = useState(initialSection);
  const [isEditingProfile, setIsEditingProfile] = useState(searchParams.get('mode') === 'edit');
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    webPushEnabled: true,
    emailEnabled: true,
    gasAlertEnabled: true,
    intruderAlertEnabled: true,
    wrongPassAlertEnabled: true,
    fingerprintAlertEnabled: true,
  });
  const [notificationPassword, setNotificationPassword] = useState('');
  const [preferencesMessage, setPreferencesMessage] = useState('');
  const [preferencesError, setPreferencesError] = useState('');
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  const [preferencesLoading, setPreferencesLoading] = useState(true);

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState('');

  useEffect(() => {
    setProfileForm({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      dateOfBirth: user?.dateOfBirth || '',
      address: user?.address || '',
      bio: user?.bio || '',
    });
  }, [user]);

  useEffect(() => {
    setActiveSection(initialSection);
    setIsEditingProfile(searchParams.get('mode') === 'edit');
  }, [initialSection, searchParams]);

  useEffect(() => () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
  }, [avatarPreview]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      setPreferencesLoading(true);
      setSessionsLoading(true);
      try {
        const [notifications, loginSessions] = await Promise.all([
          smartLockApi.getNotificationSettings(),
          smartLockApi.getLoginActivity(),
        ]);
        if (!isMounted) return;
        if (notifications) {
          setNotificationSettings({
            webPushEnabled: !!notifications.webPushEnabled,
            emailEnabled: !!notifications.emailEnabled,
            gasAlertEnabled: !!notifications.gasAlertEnabled,
            intruderAlertEnabled: !!notifications.intruderAlertEnabled,
            wrongPassAlertEnabled: !!notifications.wrongPassAlertEnabled,
            fingerprintAlertEnabled: !!notifications.fingerprintAlertEnabled,
          });
        }
        setSessions(Array.isArray(loginSessions) ? loginSessions : []);
        setSessionsError('');
      } catch (error) {
        if (!isMounted) return;
        setPreferencesError(error.message || 'Unable to load account preferences.');
        setSessionsError(error.message || 'Unable to load login activity.');
      } finally {
        if (!isMounted) return;
        setPreferencesLoading(false);
        setSessionsLoading(false);
      }
    };

    bootstrap();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentSession = useMemo(
    () => sessions.find((session) => session.current) || null,
    [sessions]
  );

  const updateSearch = (section, mode) => {
    const next = new URLSearchParams();
    next.set('section', section);
    if (mode) next.set('mode', mode);
    setSearchParams(next, { replace: true });
    setActiveSection(section);
    setIsEditingProfile(mode === 'edit');
  };

  const handleProfileFieldChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileMessage('');

    try {
      const payload = {
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
        gender: profileForm.gender.trim(),
        dateOfBirth: profileForm.dateOfBirth || null,
        address: profileForm.address.trim(),
        bio: profileForm.bio.trim(),
      };
      const updated = await smartLockApi.updateCurrentProfile(payload);
      applyUserProfile(updated);
      setProfileMessage('Profile updated successfully.');
      setIsEditingProfile(false);
      updateSearch('profile');
    } catch (error) {
      setProfileError(error.message || 'Unable to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarSelection = (event) => {
    const file = event.target.files?.[0];
    setAvatarError('');
    setProfileMessage('');

    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setAvatarFile(null);
      setAvatarPreview('');
      setAvatarError('Only PNG, JPG, WEBP, and GIF files are allowed.');
      return;
    }

    if (file.size > 1024 * 1024) {
      setAvatarFile(null);
      setAvatarPreview('');
      setAvatarError('Avatar must be 1MB or smaller.');
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setAvatarUploading(true);
    setAvatarError('');
    setProfileMessage('');

    try {
      const updated = await smartLockApi.uploadAvatar(avatarFile);
      applyUserProfile(updated);
      setAvatarFile(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview('');
      setProfileMessage('Avatar updated successfully.');
    } catch (error) {
      setAvatarError(error.message || 'Unable to upload avatar.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handlePreferenceToggle = (key) => {
    setNotificationSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  const handlePreferenceSave = async (event) => {
    event.preventDefault();
    setPreferencesSaving(true);
    setPreferencesError('');
    setPreferencesMessage('');

    try {
      if (!notificationPassword.trim()) {
        throw new Error('Current password is required to save notification settings.');
      }
      const verification = await smartLockApi.reAuthenticate(notificationPassword.trim());
      await smartLockApi.updateNotificationSettings(notificationSettings, verification.verificationToken);
      setPreferencesMessage('Settings saved successfully.');
      setNotificationPassword('');
    } catch (error) {
      setPreferencesError(error.message || 'Unable to save settings.');
    } finally {
      setPreferencesSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 relative pb-20">
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-headline font-extrabold tracking-tighter text-on-surface mb-2">
            Account Settings
          </h1>
          <p className="text-outline font-body opacity-80">
            Manage avatar, profile details, preferences, and active login sessions.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PROFILE_SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => updateSearch(section.id, section.id === 'profile' && isEditingProfile ? 'edit' : null)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]'
                    : 'bg-surface-container text-outline hover:text-on-surface border border-outline-variant/15'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{section.icon}</span>
                {section.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 space-y-6">
          <div className="relative bg-surface-container rounded-[2rem] p-7 border border-outline-variant/10 shadow-sm overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="flex flex-col items-center text-center">
              <UserAvatar
                src={avatarPreview || user?.avatarUrl}
                name={user?.fullName}
                size="w-28 h-28"
                className="mb-5"
                ringClassName="animate-pulse"
              />
              <h2 className="text-2xl font-black tracking-tight text-on-surface">{user?.fullName || 'Sentinel User'}</h2>
              <p className="text-sm text-outline mt-1">{user?.email}</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary data-pulse" />
                {user?.role || 'MEMBER'}
              </div>
              <p className="mt-4 text-sm text-outline leading-relaxed max-w-xs">
                {user?.bio || 'Add a short bio to make your profile easier to recognize across security surfaces.'}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <label className="block">
                <span className="sr-only">Choose avatar</span>
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleAvatarSelection} />
                <span className="flex items-center justify-center gap-2 rounded-2xl border border-outline-variant/15 bg-surface-container-high px-4 py-3 text-sm font-semibold text-on-surface cursor-pointer hover:border-primary/25 transition-all">
                  <span className="material-symbols-outlined text-[18px] text-primary">upload</span>
                  Choose avatar
                </span>
              </label>

              <button
                type="button"
                onClick={handleAvatarUpload}
                disabled={!avatarFile || avatarUploading}
                className="w-full rounded-2xl bg-gradient-to-br from-primary-container to-primary px-4 py-3 text-sm font-bold text-on-primary-container transition-all hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {avatarUploading ? 'Uploading avatar...' : avatarFile ? 'Upload selected avatar' : 'Select a file first'}
              </button>

              {avatarError && <p className="text-sm text-error">{avatarError}</p>}
              {profileMessage && <p className="text-sm text-primary">{profileMessage}</p>}
              {profileError && <p className="text-sm text-error">{profileError}</p>}
            </div>
          </div>

          <div className="bg-surface-container rounded-[2rem] p-7 border border-outline-variant/10 shadow-sm">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-4">Account snapshot</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-outline">Theme</span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-1.5 text-on-surface hover:border-primary/20 transition-all border border-outline-variant/10"
                >
                  <span className="material-symbols-outlined text-[18px]">{theme === 'dark' ? 'dark_mode' : 'light_mode'}</span>
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-outline">Last login</span>
                <span className="text-on-surface font-semibold text-right">{formatDateTime(user?.lastLogin)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-outline">Current session</span>
                <span className="text-on-surface font-semibold text-right">{currentSession?.deviceName || 'Current browser session'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-8">
          {activeSection === 'profile' && (
            <div className="bg-surface-container rounded-[2rem] p-8 border border-outline-variant/10 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-2xl font-headline font-bold text-on-surface">Profile details</h3>
                  <p className="text-outline text-sm mt-1">Your account data is stored securely and only editable by the current signed-in user.</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextMode = !isEditingProfile;
                    setIsEditingProfile(nextMode);
                    updateSearch('profile', nextMode ? 'edit' : null);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-outline-variant/15 bg-surface-container-high px-4 py-3 text-sm font-bold text-on-surface hover:border-primary/20 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">{isEditingProfile ? 'visibility' : 'edit_square'}</span>
                  {isEditingProfile ? 'View mode' : 'Edit profile'}
                </button>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleProfileSave}>
                <label className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">Full name</span>
                  <input
                    name="fullName"
                    value={profileForm.fullName}
                    onChange={handleProfileFieldChange}
                    disabled={!isEditingProfile || profileSaving}
                    className="w-full rounded-2xl bg-surface-container-high border border-outline-variant/10 px-4 py-3 outline-none focus:ring-1 focus:ring-primary text-on-surface disabled:opacity-70"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">Phone</span>
                  <input
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileFieldChange}
                    disabled={!isEditingProfile || profileSaving}
                    className="w-full rounded-2xl bg-surface-container-high border border-outline-variant/10 px-4 py-3 outline-none focus:ring-1 focus:ring-primary text-on-surface disabled:opacity-70"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">Gender</span>
                  <input
                    name="gender"
                    value={profileForm.gender}
                    onChange={handleProfileFieldChange}
                    disabled={!isEditingProfile || profileSaving}
                    className="w-full rounded-2xl bg-surface-container-high border border-outline-variant/10 px-4 py-3 outline-none focus:ring-1 focus:ring-primary text-on-surface disabled:opacity-70"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">Date of birth</span>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profileForm.dateOfBirth}
                    onChange={handleProfileFieldChange}
                    disabled={!isEditingProfile || profileSaving}
                    className="w-full rounded-2xl bg-surface-container-high border border-outline-variant/10 px-4 py-3 outline-none focus:ring-1 focus:ring-primary text-on-surface disabled:opacity-70"
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">Address</span>
                  <input
                    name="address"
                    value={profileForm.address}
                    onChange={handleProfileFieldChange}
                    disabled={!isEditingProfile || profileSaving}
                    className="w-full rounded-2xl bg-surface-container-high border border-outline-variant/10 px-4 py-3 outline-none focus:ring-1 focus:ring-primary text-on-surface disabled:opacity-70"
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">Bio</span>
                  <textarea
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileFieldChange}
                    disabled={!isEditingProfile || profileSaving}
                    rows={5}
                    className="w-full rounded-2xl bg-surface-container-high border border-outline-variant/10 px-4 py-3 outline-none focus:ring-1 focus:ring-primary text-on-surface disabled:opacity-70 resize-none"
                  />
                </label>

                {isEditingProfile && (
                  <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-primary-container to-primary px-5 py-3 text-sm font-bold text-on-primary-container transition-all hover:opacity-95 disabled:opacity-60"
                    >
                      {profileSaving ? (
                        <>
                          <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">save</span>
                          Save profile
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileForm({
                          fullName: user?.fullName || '',
                          phone: user?.phone || '',
                          gender: user?.gender || '',
                          dateOfBirth: user?.dateOfBirth || '',
                          address: user?.address || '',
                          bio: user?.bio || '',
                        });
                        setIsEditingProfile(false);
                        updateSearch('profile');
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant/15 px-5 py-3 text-sm font-bold text-outline hover:text-on-surface hover:border-primary/20 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeSection === 'preferences' && (
            <div className="bg-surface-container rounded-[2rem] p-8 border border-outline-variant/10 shadow-sm">
              <div className="mb-8">
                <h3 className="text-2xl font-headline font-bold text-on-surface">Notification & account preferences</h3>
                <p className="text-outline text-sm mt-1">Existing settings are protected with step-up verification before saving changes.</p>
              </div>

              {preferencesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-20 rounded-2xl bg-surface-container-high animate-pulse" />
                  ))}
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handlePreferenceSave}>
                  {[
                    ['webPushEnabled', 'Web push alerts', 'Live browser security alerts'],
                    ['emailEnabled', 'Email digest', 'Daily and critical account summaries'],
                    ['gasAlertEnabled', 'Gas alerts', 'Immediate gas leak notifications'],
                    ['intruderAlertEnabled', 'Intruder alerts', 'Unauthorized access activity'],
                    ['wrongPassAlertEnabled', 'Wrong password alerts', 'Failed keypad attempts'],
                    ['fingerprintAlertEnabled', 'Fingerprint alerts', 'Biometric enrollment and usage events'],
                  ].map(([key, title, description]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handlePreferenceToggle(key)}
                      className="w-full flex items-center justify-between gap-4 rounded-2xl bg-surface-container-high border border-outline-variant/10 px-5 py-4 text-left hover:border-primary/20 transition-all"
                    >
                      <div>
                        <div className="text-sm font-semibold text-on-surface">{title}</div>
                        <div className="text-xs text-outline mt-1">{description}</div>
                      </div>
                      <div className={`w-12 h-7 rounded-full px-1 flex items-center transition-all ${notificationSettings[key] ? 'bg-primary justify-end' : 'bg-surface-container-highest justify-start'}`}>
                        <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                      </div>
                    </button>
                  ))}

                  <label className="space-y-2 block">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">Current password</span>
                    <input
                      type="password"
                      value={notificationPassword}
                      onChange={(event) => setNotificationPassword(event.target.value)}
                      placeholder="Required to save preference changes"
                      className="w-full rounded-2xl bg-surface-container-high border border-outline-variant/10 px-4 py-3 outline-none focus:ring-1 focus:ring-primary text-on-surface"
                    />
                  </label>

                  {preferencesError && <p className="text-sm text-error">{preferencesError}</p>}
                  {preferencesMessage && <p className="text-sm text-primary">{preferencesMessage}</p>}

                  <button
                    type="submit"
                    disabled={preferencesSaving}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-primary-container to-primary px-5 py-3 text-sm font-bold text-on-primary-container transition-all hover:opacity-95 disabled:opacity-60"
                  >
                    {preferencesSaving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
                        Saving settings...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">shield_lock</span>
                        Save preferences
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeSection === 'logins' && (
            <div className="bg-surface-container rounded-[2rem] p-8 border border-outline-variant/10 shadow-sm">
              <div className="mb-8">
                <h3 className="text-2xl font-headline font-bold text-on-surface">Login activity</h3>
                <p className="text-outline text-sm mt-1">Review your current device and the most recent authenticated sessions.</p>
              </div>

              {sessionsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-28 rounded-2xl bg-surface-container-high animate-pulse" />
                  ))}
                </div>
              ) : sessionsError ? (
                <div className="rounded-2xl border border-error/20 bg-error/5 px-5 py-4 text-error text-sm">{sessionsError}</div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`rounded-2xl border px-5 py-4 transition-all ${
                        session.current
                          ? 'border-primary/20 bg-primary/5 shadow-[0_0_24px_color-mix(in_srgb,var(--color-primary)_12%,transparent)]'
                          : 'border-outline-variant/10 bg-surface-container-high'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-[22px]">
                              {session.current ? 'verified_user' : 'computer'}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-on-surface">
                                {session.deviceName || 'Unknown device'}
                                {session.current && (
                                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-primary">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary data-pulse" />
                                    Current
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-outline">{session.ipAddress || 'IP unavailable'}</p>
                            </div>
                          </div>
                          <p className="text-sm text-outline break-all">{session.userAgent || 'User agent unavailable'}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-[18rem]">
                          <div className="rounded-2xl bg-surface-container px-4 py-3 border border-outline-variant/10">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-outline font-bold">Signed in</div>
                            <div className="text-sm font-semibold text-on-surface mt-1">{formatDateTime(session.createdAt)}</div>
                          </div>
                          <div className="rounded-2xl bg-surface-container px-4 py-3 border border-outline-variant/10">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-outline font-bold">Last active</div>
                            <div className="text-sm font-semibold text-on-surface mt-1">{formatDateTime(session.lastActiveAt)}</div>
                          </div>
                        </div>
                      </div>

                      {session.loggedOutAt && (
                        <p className="mt-3 text-xs text-outline">
                          Logged out at {formatDateTime(session.loggedOutAt)}
                        </p>
                      )}
                    </div>
                  ))}

                  {sessions.length === 0 && (
                    <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-high px-5 py-8 text-center text-outline">
                      No login activity is available yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Settings;
