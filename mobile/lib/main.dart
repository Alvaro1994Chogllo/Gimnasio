import 'package:flutter/material.dart';
import 'pages/home_page.dart';

void main() {
  runApp(const GimnasioApp());
}

class GimnasioApp extends StatelessWidget {
  const GimnasioApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Gimnasio Mobile',
      theme: ThemeData.dark().copyWith(
        colorScheme: const ColorScheme.dark(
          primary: Colors.deepOrange,
          secondary: Colors.amber,
        ),
      ),
      home: const HomePage(),
    );
  }
}
