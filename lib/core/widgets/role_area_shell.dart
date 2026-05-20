import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class RoleAreaShell extends StatelessWidget {
  const RoleAreaShell({
    required this.title,
    required this.navigationItems,
    required this.child,
    super.key,
  });

  final String title;
  final List<RoleNavigationItem> navigationItems;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: NavigationDrawer(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 12),
            child: Text(title, style: Theme.of(context).textTheme.titleLarge),
          ),
          for (final item in navigationItems)
            NavigationDrawerDestination(
              icon: Icon(item.icon),
              label: Text(item.label),
            ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout),
            title: const Text('Sair'),
            onTap: () => context.go('/login'),
          ),
        ],
      ),
      body: child,
    );
  }
}

class RoleNavigationItem {
  const RoleNavigationItem({
    required this.label,
    required this.icon,
    required this.route,
  });

  final String label;
  final IconData icon;
  final String route;
}
