import assert from 'node:assert/strict';
import test from 'node:test';

import {
  hasPanelPermission,
  resolvePanelUser,
  systemAdminEmails,
} from '../lib/panel-authorization.ts';

test('all authenticated members can read the calendar, but ordinary members cannot edit it', () => {
  const member = resolvePanelUser('member@sauformula.org');
  assert.equal(hasPanelPermission(member, 'calendar.read'), true);
  assert.equal(hasPanelPermission(member, 'departments.read'), true);
  assert.equal(hasPanelPermission(member, 'tasks.read'), true);
  assert.equal(hasPanelPermission(member, 'calendar.manage'), false);
  assert.equal(hasPanelPermission(member, 'departments.manage'), false);
  assert.equal(hasPanelPermission(member, 'tasks.manage'), false);
});

test('chiefs can manage operational modules but cannot change permissions', () => {
  const chief = resolvePanelUser('chief@sauformula.org', { role: 'chief' });
  assert.equal(hasPanelPermission(chief, 'calendar.manage'), true);
  assert.equal(hasPanelPermission(chief, 'departments.manage'), true);
  assert.equal(hasPanelPermission(chief, 'tasks.manage'), true);
  assert.equal(hasPanelPermission(chief, 'applications.manage'), true);
  assert.equal(hasPanelPermission(chief, 'members.read'), true);
  assert.equal(hasPanelPermission(chief, 'members.manage'), false);
  assert.equal(hasPanelPermission(chief, 'permissions.manage'), false);
});

test('advisors can manage every operational module without changing members or permissions', () => {
  const advisor = resolvePanelUser('advisor@sauformula.org', {
    role: 'advisor',
  });

  assert.equal(hasPanelPermission(advisor, 'calendar.manage'), true);
  assert.equal(hasPanelPermission(advisor, 'departments.manage'), true);
  assert.equal(hasPanelPermission(advisor, 'tasks.manage'), true);
  assert.equal(hasPanelPermission(advisor, 'sponsorship.manage'), true);
  assert.equal(hasPanelPermission(advisor, 'inventory.manage'), true);
  assert.equal(hasPanelPermission(advisor, 'purchases.manage'), true);
  assert.equal(hasPanelPermission(advisor, 'applications.manage'), true);
  assert.equal(hasPanelPermission(advisor, 'members.read'), true);
  assert.equal(hasPanelPermission(advisor, 'members.manage'), false);
  assert.equal(hasPanelPermission(advisor, 'permissions.manage'), false);
});

test('team leaders and system admins can change permissions', () => {
  const teamLead = resolvePanelUser('lead@sauformula.org', {
    role: 'team_lead',
  });
  assert.equal(hasPanelPermission(teamLead, 'permissions.manage'), true);
  assert.equal(hasPanelPermission(teamLead, 'members.manage'), true);

  for (const email of systemAdminEmails) {
    const admin = resolvePanelUser(email);
    assert.equal(admin.role, 'admin');
    assert.equal(hasPanelPermission(admin, 'permissions.manage'), true);
  }
});

test('database records cannot grant system administrator to arbitrary emails', () => {
  const forgedAdmin = resolvePanelUser('not-admin@sauformula.org', {
    role: 'admin',
  });
  assert.equal(forgedAdmin.role, 'member');
  assert.equal(hasPanelPermission(forgedAdmin, 'permissions.manage'), false);
});

test('sponsorship department and delegates can manage sponsorship only', () => {
  const sponsorMember = resolvePanelUser('sponsor@sauformula.org', {
    department: 'sponsorship-partnerships',
  });
  const delegate = resolvePanelUser('delegate@sauformula.org', {
    specialRoles: ['sponsorship_delegate'],
  });

  assert.equal(hasPanelPermission(sponsorMember, 'sponsorship.manage'), true);
  assert.equal(hasPanelPermission(delegate, 'sponsorship.manage'), true);
  assert.equal(hasPanelPermission(delegate, 'inventory.manage'), false);
});

test('finance and operations can manage inventory and purchasing', () => {
  const member = resolvePanelUser('finance@sauformula.org', {
    department: 'finance-operations',
  });
  assert.equal(hasPanelPermission(member, 'inventory.manage'), true);
  assert.equal(hasPanelPermission(member, 'purchases.manage'), true);
  assert.equal(hasPanelPermission(member, 'applications.manage'), false);
});
